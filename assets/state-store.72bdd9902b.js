// Load, save and clear: logic spec sections 3 and 13. Every storage call is wrapped in try/catch.
// If storage is blocked or full, the app keeps going in memory and shows a banner.
import { STORAGE_KEY, TAB_KEY, STATE_VERSION, MAX_QUESTS } from './engine-constants.f6f2fc2188.js';
import { emptyState, validateState, migrate } from './state-model.76e8252557.js';

export function safeStorage(getStorage) {
  try { return getStorage() || null; } catch { return null; }
}

export class Store {
  constructor(storage) {
    this.storage = storage; // a Storage-like object or null
    this.state = emptyState();
    this.memoryOnly = !storage; // shows "Results will not be saved on this device"
    this.newer = false;         // the device holds data from a newer version: never overwrite it
    this.invalid = false;       // the saved data does not match the model: never overwrite it silently
    this.trimmed = false;       // older quests were dropped to fit
    this.listeners = new Set();
  }

  load() {
    this.newer = false; this.invalid = false;
    let raw = null;
    try { raw = this.storage ? this.storage.getItem(STORAGE_KEY) : null; } catch { this.memoryOnly = true; }
    if (raw === null || raw === undefined) { this.state = emptyState(); return this.state; }
    let parsed;
    try { parsed = JSON.parse(raw); } catch { this.invalid = true; this.state = emptyState(); return this.state; }
    if (parsed && Number.isInteger(parsed.version) && parsed.version > STATE_VERSION) {
      this.newer = true; this.state = emptyState(); return this.state;
    }
    const m = migrate(parsed);
    if (!m || !validateState(m).ok) { this.invalid = true; this.state = emptyState(); return this.state; }
    this.state = m;
    return this.state;
  }

  get readOnly() { return this.newer || this.invalid; }

  set(next) {
    this.state = next;
    this.save();
    for (const fn of this.listeners) fn(this.state);
  }

  save() {
    if (this.readOnly) return false;
    if (!this.storage) { this.memoryOnly = true; return false; }
    for (let attempt = 0; attempt < 400; attempt++) {
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.memoryOnly = false;
        return true;
      } catch (e) {
        if (!isQuota(e) || !dropOldestQuest(this.state)) { this.memoryOnly = true; return false; }
        this.trimmed = true;
      }
    }
    this.memoryOnly = true;
    return false;
  }

  // Clear data: the saved keys and every in-memory copy.
  clearAll() {
    try { if (this.storage) { this.storage.removeItem(STORAGE_KEY); this.storage.removeItem(TAB_KEY); } } catch { /* nothing saved to remove */ }
    this.state = emptyState();
    this.newer = false; this.invalid = false; this.trimmed = false;
    for (const fn of this.listeners) fn(this.state);
  }

  // Remove one learner and everything saved about them.
  removeLearner(id) {
    const learners = this.state.learners.filter(l => l.id !== id);
    const activeLearnerId = learners.some(l => l.id === this.state.activeLearnerId) ? this.state.activeLearnerId : (learners[0] ? learners[0].id : null);
    this.set({ ...this.state, learners, activeLearnerId });
  }

  updateLearner(id, fn) {
    const learners = this.state.learners.map(l => (l.id === id ? fn(l) : l));
    this.set({ ...this.state, learners });
  }

  learner(id = this.state.activeLearnerId) {
    return this.state.learners.find(l => l.id === id) || null;
  }

  // Another tab saved: reload from storage (the storage event, section 13).
  reloadFromOther() {
    const wasReadOnly = this.readOnly;
    this.load();
    if (!wasReadOnly || !this.readOnly) for (const fn of this.listeners) fn(this.state);
  }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
}

export function capQuests(learner) {
  return learner.quests.length > MAX_QUESTS ? { ...learner, quests: learner.quests.slice(-MAX_QUESTS) } : learner;
}

function isQuota(e) {
  return e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
}

// Drops the single oldest quest across all learners. Returns false if there is none.
function dropOldestQuest(state) {
  let best = null;
  for (const l of state.learners) if (l.quests.length && (!best || l.quests[0].at < best.quests[0].at)) best = l;
  if (!best) return false;
  best.quests = best.quests.slice(1);
  return true;
}
