// Boot: storage, routing, and the page-level listeners for the attention signals.
// Signals are recorded only while a quest runs (Telemetry ignores them otherwise).
import { BANK, INTERESTS, TOPIC_MAP, SITE, SUBJECTS_AVAILABLE, GLOSSARY, PROMPT_AUDIO, MEDIA } from './data.dc8f6dbdee.js';
import { Store, safeStorage } from './state-store.72bdd9902b.js';
import { Telemetry } from './engine-telemetry.751c13a370.js';
import { systemClock } from './engine-clock.cb87acb031.js';
import { STORAGE_KEY, TAB_KEY } from './engine-constants.f6f2fc2188.js';
import { BANNERS } from './text-copy.5e71bb1047.js';
import { h, clear } from './ui-dom.43bde315e2.js';
import { openLayer, closeLayer } from './ui-layer.bb980036ff.js';
import { celebrate, motionOn } from './ui-stage.b19732b10d.js';
import { routes, guard } from './ui-routes.c63a64a98d.js';
import { syncReminder } from './ui-reminder.a8894c8223.js';

const storage = safeStorage(() => window.localStorage);
const store = new Store(storage);
store.load();

const tabId = globalThis.crypto.randomUUID();

export const app = {
  store,
  data: { BANK, INTERESTS, TOPIC_MAP, SITE, SUBJECTS_AVAILABLE, GLOSSARY, PROMPT_AUDIO, MEDIA },
  clock: systemClock,
  tel: new Telemetry(systemClock),
  run: null,          // the running quest, in memory only
  lastQuest: null,    // the quest just finished, for the summary screen
  grownupOpen: false,
  pausedByOtherTab: false,
  flash: null,        // one short status message for the next render
  bankOk: Array.isArray(BANK) && BANK.length > 0 && BANK.every(p => Array.isArray(p.questions) && p.questions.length === 8),

  route() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const [name, ...rest] = raw.split('/');
    return { name: name || '', arg: rest.join('/') };
  },

  go(path) {
    const next = `#/${path}`;
    if (location.hash === next) this.render();
    else location.hash = next;
  },

  learner() { return this.store.learner(); },

  save(next) { this.store.set(next); },

  updateLearner(fn) { this.store.updateLearner(this.store.state.activeLearnerId, fn); },

  claimTab() {
    try { if (storage) storage.setItem(TAB_KEY, JSON.stringify({ tab: tabId })); } catch { /* storage blocked: nothing to coordinate */ }
  },

  // Drops a running quest: not scored, not saved, the passage stays unseen.
  dropQuest() {
    if (this.run) this.run.abandon();
    this.run = null;
    this.pausedByOtherTab = false;
  },

  render() {
    const r = this.route();
    const target = guard(this, r);
    // Back during a quest: keep the screen as it is (a picked answer or a typed sentence stays) and put
    // the quest back on top of the history, so pressing Back again cannot walk out of the app.
    if (target === 'quest' && this.shown === 'quest' && this.run) {
      history.pushState(null, '', '#/quest');
      return;
    }
    if (target !== null && target !== `${r.name}${r.arg ? '/' + r.arg : ''}`) {
      history.replaceState(null, '', `#/${target}`);
      return this.render();
    }
    const screen = routes[r.name];
    this.shown = r.name;
    const main = document.getElementById('main');
    clear(main);
    closeLayer();
    const node = screen(this, r.arg);
    document.body.className = (node.dataset.theme === 'parent' ? 'parent' : 'child') + (motionOn(this) ? '' : ' still') + (r.name === 'quest' ? ' in-quest' : '');
    main.append(node);
    renderBanner(this);
    if (this.pausedByOtherTab) showPause(this);
    const focusEl = main.querySelector('[data-autofocus]') || main.querySelector('h1');
    if (focusEl) { if (!focusEl.hasAttribute('tabindex') && focusEl.tagName === 'H1') focusEl.setAttribute('tabindex', '-1'); focusEl.focus({ preventScroll: false }); }
    window.scrollTo(0, 0);
    // A celebration waits for the summary or starting point screen, so it never interrupts a question.
    if (this.pendingCelebration && ['summary', 'start'].includes(r.name)) {
      const c = this.pendingCelebration;
      this.pendingCelebration = null;
      setTimeout(() => celebrate(this, c), 450);
    }
    // Feedback appears below the answer choices: bring it into view so a child on a phone sees it.
    const reveal = main.querySelector('[data-reveal]');
    if (reveal) {
      const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      reveal.scrollIntoView({ block: 'end', behavior: still ? 'auto' : 'smooth' });
    }
  }
};

function renderBanner(a) {
  const el = document.getElementById('banner');
  clear(el);
  const msgs = [];
  if (a.store.memoryOnly) msgs.push(BANNERS.memoryOnly);
  if (a.store.trimmed) msgs.push(BANNERS.trimmed);
  if (a.flash) { msgs.push(a.flash); a.flash = null; }
  el.hidden = msgs.length === 0;
  for (const m of msgs) el.append(h('p', { text: m }));
}

function showPause(a) {
  const d = h('dialog', { class: 'sheet', 'aria-labelledby': 'pause-title' },
    h('h2', { id: 'pause-title', text: BANNERS.otherTab }),
    h('p', { text: 'This quest is paused here. You can carry on in this tab instead.' }),
    h('button', { class: 'btn primary', type: 'button', onclick: () => { a.pausedByOtherTab = false; a.claimTab(); closeLayer(); } }, 'Use Beacon here'));
  d.addEventListener('cancel', e => e.preventDefault());
  openLayer(d);
}

// Attention signals (logic spec 8.2 and 8.3).
document.addEventListener('visibilitychange', () => (document.visibilityState === 'hidden' ? app.tel.hidden() : app.tel.visible()));
window.addEventListener('pagehide', () => app.tel.hidden());
window.addEventListener('pageshow', () => app.tel.visible());
window.addEventListener('blur', () => app.tel.blur());
window.addEventListener('focus', () => app.tel.visible());

function regionOf(sel) {
  let n = sel && sel.anchorNode;
  if (n && n.nodeType !== 1) n = n.parentElement;
  const el = n && n.closest ? n.closest('[data-region]') : null;
  return el ? el.dataset.region : 'other';
}
for (const type of ['copy', 'cut']) {
  document.addEventListener(type, () => {
    if (!app.run) return;
    const sel = window.getSelection();
    // Only the length is kept. The selected text is never stored.
    const len = sel ? sel.toString().length : 0;
    app.tel.copy(len, regionOf(sel));
  });
}

// Two tabs (section 13): the storage event only.
window.addEventListener('storage', e => {
  if (e.key === TAB_KEY) {
    if (app.run && e.newValue) { app.pausedByOtherTab = true; showPause(app); }
    return;
  }
  if (e.key === STORAGE_KEY || e.key === null) {
    app.store.reloadFromOther();
    if (!app.run) app.render();
  }
});

window.addEventListener('hashchange', () => app.render());
syncReminder(app); // in the apps, keep the scheduled reminder in step with the saved setting
app.render();
