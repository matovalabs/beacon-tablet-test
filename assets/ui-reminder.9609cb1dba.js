// The grown-up's daily reminder (logic spec section 19), in the iPad and Android apps only. The page hands
// the saved setting to the app, which schedules one quiet notification a day on the device. Nothing is sent
// anywhere. In a browser there is no bridge, so the setting is not shown.
// Version 0.7: kind sentences that take turns, a suggested time from the hours texts are finished (the
// grown-up taps to use it), a pause after a week of reminders with no reading, and the come-back counts.
import { h } from './ui-dom.43bde315e2.js';
import { REMINDER, STABILITY } from './text-copy.a37af2a234.js';
import { REMINDER_FIRST_HOUR, REMINDER_LAST_HOUR } from './engine-constants.3213d107a9.js';
import {
  localDay, readingDaySet, reminderTick, reminderOn, reminderSentenceIndex, suggestedHour,
  deviceScore, pauseAfter, SCORE_LOW, startSession, endSession, recordLaunch, settleReminder
} from './engine-retention.c576d6d48c.js';
import { defaultSettings } from './state-model.434db42c3d.js';

function bridge() {
  const handlers = globalThis.webkit && globalThis.webkit.messageHandlers;
  if (handlers && handlers.beaconReminder) return r => handlers.beaconReminder.postMessage(r);
  const android = globalThis.BeaconReminder;
  if (android && typeof android.set === 'function') return r => android.set(r.on, r.hour, r.text, r.left);
  return null;
}

export const remindersAvailable = () => bridge() !== null;

const today = app => localDay(app.clock.nowIso());
const settingsOf = app => ({ ...defaultSettings(), ...(app.store.state.settings || {}) });
function saveSettings(app, patch) {
  if (app.store.readOnly) return;
  app.save({ ...app.store.state, settings: { ...settingsOf(app), ...patch } });
}

// Today's sentence: the kind ones take turns; when the come-back score is low, the gentler ones do.
export function reminderSentence(score, day) {
  const list = score < SCORE_LOW ? REMINDER.gentle : REMINDER.notifications;
  return list[reminderSentenceIndex(day, list.length)];
}

// Tells the app the saved setting: at start, when a grown-up changes it, and after Clear data. First it
// counts the days since the last check, and pauses the reminder after a week with no reading.
// left: how many more reminders the app may show before the next time Beacon is opened, so the pause
// also happens when Beacon is never opened.
export function syncReminder(app) {
  const st = app.store.state;
  if (!st.settings || !st.settings.reminder) return;
  const day = today(app);
  const limit = pauseAfter(deviceScore(st.learners, st.settings, day));
  const r = st.settings.reminder;
  const next = reminderTick(r, readingDaySet(st.learners), day, { limit });
  if (next !== r && remindersAvailable()) saveSettings(app, { reminder: next });
  const send = bridge();
  if (!send) return;
  const score = deviceScore(app.store.state.learners, app.store.state.settings, day);
  send({ on: next.on, paused: next.paused, hour: next.hour, text: reminderSentence(score, day), left: Math.max(0, limit - next.unanswered) });
}

// The come-back counts (section 19), on this device only. At start: count an unexpected close if the last
// session never closed, count how Beacon was opened, and settle an earlier reminder opening.
let startedAt = null;
function appLaunchSource() {
  const android = globalThis.BeaconReminder;
  if (android && typeof android.takeLaunch === 'function') return android.takeLaunch() === 'reminder' ? 'reminder' : 'icon';
  return 'icon';
}

export function startSignals(app) {
  const st = app.store.state;
  if (!st.consent || !st.settings || !st.settings.signals || app.store.readOnly) return;
  const day = today(app);
  let g = startSession(st.settings.signals);
  g = settleReminder(recordLaunch(g, appLaunchSource(), day), readingDaySet(st.learners), day);
  saveSettings(app, { signals: g });
  startedAt = app.clock.mono();
  // The iPad app says so when a grown-up's reminder opened Beacon (it may arrive just after the start).
  globalThis.beaconLaunch = source => {
    if (source !== 'reminder') return;
    const s = app.store.state.settings && app.store.state.settings.signals;
    if (!s) return;
    const justStarted = startedAt !== null && app.clock.mono() - startedAt < 5000;
    saveSettings(app, { signals: recordLaunch(s, 'reminder', today(app), { reclassify: justStarted }) });
  };
}

// The page is hidden or left: a clean close. Shown again: open again (and on Android, was it the reminder?).
export function pageHidden(app) {
  const s = app.store.state.settings && app.store.state.settings.signals;
  if (s && s.sessionOpen && app.store.state.consent && !app.store.readOnly) saveSettings(app, { signals: endSession(s) });
}
export function pageShown(app) {
  const s = app.store.state.settings && app.store.state.settings.signals;
  if (!s || !app.store.state.consent || app.store.readOnly) return;
  const android = globalThis.BeaconReminder;
  const fromReminder = android && typeof android.takeLaunch === 'function' && android.takeLaunch() === 'reminder';
  let g = startSession(s);
  if (fromReminder) { g = recordLaunch(g, 'reminder', today(app)); startedAt = app.clock.mono(); }
  if (g !== s) saveSettings(app, { signals: g });
}

// After a finished text: a reminder opening today led to reading.
export function noteFinishedText(app) {
  const st = app.store.state;
  const s = st.settings && st.settings.signals;
  if (!s || !s.pendingReminderDay) return;
  const g = settleReminder(s, readingDaySet(st.learners), today(app));
  if (g !== s) saveSettings(app, { signals: g });
}

// Settings and privacy: unexpected closes, if any. Shown on every device.
export function stabilityNote(app) {
  const s = app.store.state.settings && app.store.state.settings.signals;
  return s && s.uncleanExits > 0 ? h('p', { class: 'muted small', text: STABILITY.uncleanExits(s.uncleanExits) }) : null;
}

// The Settings controls: off by default, one daytime hour, a suggested hour the grown-up may use.
export function reminderSettings(app) {
  if (!remindersAvailable()) return null;
  const r = app.store.state.settings.reminder;
  const save = next => {
    saveSettings(app, { reminder: next });
    syncReminder(app);
  };
  const hours = [];
  for (let hr = REMINDER_FIRST_HOUR; hr <= REMINDER_LAST_HOUR; hr++) hours.push(hr);
  const select = h('select', { id: 'reminder-hour', disabled: !r.on, onchange: e => save({ ...app.store.state.settings.reminder, hour: Number(e.target.value) }) },
    hours.map(hr => h('option', { value: hr, selected: hr === r.hour, text: REMINDER.hourLabel(hr) })));
  const box = h('input', { type: 'checkbox', id: 'set-reminder', checked: r.on, 'aria-describedby': 'set-reminder-hint',
    onchange: e => {
      const cur = app.store.state.settings.reminder;
      save(e.target.checked ? reminderOn(cur, today(app)) : { ...cur, on: false, paused: false, unanswered: 0, lastCounted: null });
      app.render();
    } });
  const suggest = suggestedHour(app.store.state.learners);
  const offer = r.on && suggest !== null && suggest !== r.hour
    ? h('div', { class: 'note suggest' },
      h('p', { text: REMINDER.suggest(REMINDER.hourLabel(suggest)) }),
      h('button', { class: 'btn secondary', type: 'button', onclick: () => {
        save({ ...app.store.state.settings.reminder, hour: suggest });
        app.flash = REMINDER.suggestUsed;
        app.render();
      } }, REMINDER.useSuggested(REMINDER.hourLabel(suggest))))
    : null;
  return [
    h('h2', { text: REMINDER.title }),
    r.paused ? h('p', { class: 'note', role: 'status', text: REMINDER.paused }) : null,
    h('div', { class: 'consent setting' }, box, h('div', {}, h('label', { for: 'set-reminder', text: REMINDER.label }), h('p', { class: 'hint', id: 'set-reminder-hint', text: REMINDER.hint }))),
    h('div', { class: 'form' }, h('label', { for: 'reminder-hour', text: REMINDER.time }), select),
    offer
  ];
}
