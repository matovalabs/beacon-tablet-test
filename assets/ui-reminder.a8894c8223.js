// The grown-up's daily reminder (logic spec section 19), in the iPad and Android apps only. The page hands
// the saved setting to the app, which schedules one quiet notification a day on the device. Nothing is sent
// anywhere. In a browser there is no bridge, so the setting is not shown.
import { h } from './ui-dom.43bde315e2.js';
import { REMINDER } from './text-copy.5e71bb1047.js';
import { REMINDER_FIRST_HOUR, REMINDER_LAST_HOUR } from './engine-constants.f6f2fc2188.js';

function bridge() {
  const handlers = globalThis.webkit && globalThis.webkit.messageHandlers;
  if (handlers && handlers.beaconReminder) return r => handlers.beaconReminder.postMessage(r);
  const android = globalThis.BeaconReminder;
  if (android && typeof android.set === 'function') return r => android.set(r.on, r.hour, r.text);
  return null;
}

export const remindersAvailable = () => bridge() !== null;

// Tells the app the saved setting: at start, when a grown-up changes it, and after Clear data.
export function syncReminder(app) {
  const send = bridge();
  const r = app.store.state.settings && app.store.state.settings.reminder;
  if (send && r) send({ on: r.on, hour: r.hour, text: REMINDER.notification });
}

// The Settings controls: off by default, one daytime hour.
export function reminderSettings(app) {
  if (!remindersAvailable()) return null;
  const r = app.store.state.settings.reminder;
  const save = next => {
    app.save({ ...app.store.state, settings: { ...app.store.state.settings, reminder: next } });
    syncReminder(app);
  };
  const hours = [];
  for (let hr = REMINDER_FIRST_HOUR; hr <= REMINDER_LAST_HOUR; hr++) hours.push(hr);
  const select = h('select', { id: 'reminder-hour', disabled: !r.on, onchange: e => save({ ...app.store.state.settings.reminder, hour: Number(e.target.value) }) },
    hours.map(hr => h('option', { value: hr, selected: hr === r.hour, text: REMINDER.hourLabel(hr) })));
  const box = h('input', { type: 'checkbox', id: 'set-reminder', checked: r.on, 'aria-describedby': 'set-reminder-hint',
    onchange: e => { select.disabled = !e.target.checked; save({ ...app.store.state.settings.reminder, on: e.target.checked }); } });
  return [
    h('h2', { text: REMINDER.title }),
    h('div', { class: 'consent setting' }, box, h('div', {}, h('label', { for: 'set-reminder', text: REMINDER.label }), h('p', { class: 'hint', id: 'set-reminder-hint', text: REMINDER.hint }))),
    h('div', { class: 'form' }, h('label', { for: 'reminder-hour', text: REMINDER.time }), select)
  ];
}
