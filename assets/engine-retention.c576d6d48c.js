// Coming back, the kid-safe way (logic spec section 19). Every reward is earned by reading, never by
// just opening Beacon, and nothing is ever lost by missing a day:
// - a reading day is a local calendar day with at least one finished check-in or quest; the total only goes up;
// - the weekly goal counts this week's reading days and starts over each Monday, with no word about last week;
// - each reading day adds one keepsake to the shelf;
// - every finished text is a step on Lumi's path, and some steps add an item to her cliff (scenes.js).
// No streak, no points, no ranks, no timer, no energy and no deadline.

import { REMINDER_FIRST_HOUR, REMINDER_LAST_HOUR } from './engine-constants.3213d107a9.js';

export const WEEK_GOAL = 3;

// After this many finished texts, this item appears on Lumi's cliff.
export const PATH = [
  { at: 1, id: 'flowers' }, { at: 2, id: 'gull' }, { at: 3, id: 'kite' }, { at: 5, id: 'sailboat' },
  { at: 7, id: 'bunting' }, { at: 10, id: 'telescope' }, { at: 13, id: 'cottage' }, { at: 16, id: 'whale' },
  { at: 20, id: 'balloon' }, { at: 25, id: 'moon' }
];

// One keepsake for each reading day, in this order, then round again.
export const KEEPSAKES = ['shell', 'starfish', 'sea-glass', 'feather', 'pebble', 'acorn', 'leaf', 'sand-dollar'];

const pad = n => String(n).padStart(2, '0');
const dayOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// The device's local calendar day of a saved time, as YYYY-MM-DD.
export function localDay(iso) {
  return dayOf(new Date(iso));
}

// The Monday that starts the week of a local day.
export function weekOf(day) {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dayOf(date);
}

// Every saved check-in and quest record is a finished one.
const finished = learner => learner.quests || [];

export function weekGoal(learner, nowIso) {
  const week = weekOf(localDay(nowIso));
  const days = new Set(finished(learner).map(q => localDay(q.at)).filter(d => weekOf(d) === week)).size;
  return { days, goal: WEEK_GOAL, met: days >= WEEK_GOAL };
}

// Counts a new reading day when a check-in or quest is finished.
export function countReadingDay(learner, atIso) {
  const day = localDay(atIso);
  if (learner.lastReadingDay === day) return { learner, newDay: false };
  return { learner: { ...learner, readingDays: (learner.readingDays || 0) + 1, lastReadingDay: day }, newDay: true };
}

export const keepsakeFor = n => KEEPSAKES[(n - 1) % KEEPSAKES.length];

// The shelf: how many of each keepsake, in the order they were first found.
export function shelf(learner) {
  const counts = new Map();
  for (let n = 1; n <= (learner.readingDays || 0); n++) counts.set(keepsakeFor(n), (counts.get(keepsakeFor(n)) || 0) + 1);
  return [...counts].map(([id, count]) => ({ id, count }));
}

// Today's keepsake, once today's first text is finished; null before that.
export function todaysKeepsake(learner, nowIso) {
  return learner.readingDays && learner.lastReadingDay === localDay(nowIso) ? keepsakeFor(learner.readingDays) : null;
}

export function path(learner) {
  const done = finished(learner).length;
  const next = PATH.find(p => done < p.at);
  return { done, unlocked: PATH.filter(p => done >= p.at).map(p => p.id), next: next ? { id: next.id, left: next.at - done } : null };
}

export function newlyUnlocked(before, after) {
  const had = new Set(path(before).unlocked);
  return path(after).unlocked.filter(id => !had.has(id));
}

// For migration: the reading days already in the saved quests.
export function readingDaysFrom(quests) {
  const days = [...new Set((quests || []).map(q => localDay(q.at)))].sort();
  return { readingDays: days.length, lastReadingDay: days.length ? days[days.length - 1] : null };
}

// ---------------------------------------------------------------------------------------------------
// Version 0.7: the guide's mood on the island, and the smarter daily reminder (logic spec section 19).

// Whole days between two local days (YYYY-MM-DD), counted on the calendar so clock changes do not matter.
const dayNumber = day => { const [y, m, d] = day.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
export const daysBetween = (from, to) => dayNumber(to) - dayNumber(from);
const addDays = (day, n) => { const t = new Date((dayNumber(day) + n) * 86400000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };

// The guide is only ever glad: there is no sad, worried or crying mood, and no mood counts missed days.
export const GUIDE_MOODS = ['cheer', 'happy', 'welcome', 'rest'];
export const WELCOME_AFTER_DAYS = 3;
// The existing drawings each mood uses. No new art.
export const MOOD_ART = { cheer: 'cheer', happy: 'idle', welcome: 'cheer', rest: 'idle' };

// cheer: a text was finished today. welcome: back after 3 or more days away. happy: anything else
// (opened today, read within the last 2 days, or no text finished yet). rest: the island while a child
// reads or answers. Opening Beacon earns nothing: the mood is a greeting, never a reward.
export function guideMood(learner, today, { idle = false } = {}) {
  if (idle) return 'rest';
  const last = learner && learner.lastReadingDay;
  if (last === today) return 'cheer';
  if (last && daysBetween(last, today) >= WELCOME_AFTER_DAYS) return 'welcome';
  return 'happy';
}

// The local hour (0 to 23) of a saved time. Only the hour is kept, as a count, never the time itself.
export const localHour = iso => new Date(iso).getHours();
export const HOURS = 24;
export const emptyReadHours = () => Array.from({ length: HOURS }, () => 0);
const HOUR_COUNT_MAX = 9999;

export function countReadHour(learner, atIso) {
  const hours = Array.isArray(learner.readHours) && learner.readHours.length === HOURS ? [...learner.readHours] : emptyReadHours();
  const hr = localHour(atIso);
  hours[hr] = Math.min(HOUR_COUNT_MAX, hours[hr] + 1);
  return { ...learner, readHours: hours };
}

// For migration: the hour counts already in the saved quests.
export function readHoursFrom(quests) {
  return (quests || []).reduce((l, q) => countReadHour(l, q.at), { readHours: emptyReadHours() }).readHours;
}

export const SUGGEST_MIN_TEXTS = 5;

// The hour the readers on this device usually finish a text, kept to daytime (8 a.m. to 7 p.m.), once
// there are at least 5 finished texts. A suggestion only: a grown-up must tap to use it.
export function suggestedHour(learners) {
  const sum = emptyReadHours();
  for (const l of learners || []) (l.readHours || []).forEach((n, i) => { if (i < HOURS) sum[i] += n; });
  if (sum.reduce((a, b) => a + b, 0) < SUGGEST_MIN_TEXTS) return null;
  let best = 0;
  for (let i = 1; i < HOURS; i++) if (sum[i] > sum[best]) best = i;
  return Math.max(REMINDER_FIRST_HOUR, Math.min(REMINDER_LAST_HOUR, best));
}

// Which of the kind reminder sentences to use on a day: they take turns, one a day.
export const reminderSentenceIndex = (today, count) => ((dayNumber(today) % count) + count) % count;

export const PAUSE_AFTER = 7;
const TICK_MAX_DAYS = 60;

// Back off: each whole day since the last check with the reminder on and no finished text on this device
// adds one to the count; a reading day sets it back to 0. After 7 in a row (limit; 5 when the come-back
// score below is low) the reminder pauses (turns off
// and says so to the grown-up in Settings). It never turns itself back on.
// readDays: the set of local days with a finished text, on any reader. Today is checked tomorrow.
export function reminderTick(reminder, readDays, today, { limit = PAUSE_AFTER } = {}) {
  if (!reminder.on) return reminder.lastCounted === null && reminder.unanswered === 0 ? reminder : { ...reminder, unanswered: 0, lastCounted: null };
  const yesterday = addDays(today, -1);
  const from = reminder.lastCounted;
  if (from === null || daysBetween(from, yesterday) < 0) return { ...reminder, lastCounted: yesterday };
  let unanswered = reminder.unanswered;
  let day = from;
  for (let i = 0; i < TICK_MAX_DAYS && daysBetween(day, yesterday) > 0; i++) {
    day = addDays(day, 1);
    unanswered = readDays.has(day) ? 0 : unanswered + 1;
  }
  if (daysBetween(day, yesterday) > 0) unanswered = Math.max(unanswered, limit); // a long time away
  if (unanswered >= limit) return { ...reminder, on: false, paused: true, unanswered: 0, lastCounted: null };
  if (unanswered === reminder.unanswered && from === yesterday) return reminder;
  return { ...reminder, unanswered, lastCounted: yesterday };
}

// Turning the reminder on (again): clears the pause and starts counting from today.
export function reminderOn(reminder, today) {
  return { ...reminder, on: true, paused: false, unanswered: 0, lastCounted: addDays(today, -1) };
}

// Every local day with a finished text, on any reader on this device.
export function readingDaySet(learners) {
  return new Set((learners || []).flatMap(l => (l.quests || []).map(q => localDay(q.at))));
}

// ---------------------------------------------------------------------------------------------------
// The come-back score, on this device only (logic spec section 19). Counts only: how Beacon was opened
// (from the reminder or not), whether a reminder opening was followed by a finished text that day, and
// how many times Beacon closed unexpectedly. No time of day, no network, no location, no device id.
// The score is never shown to anyone and never changes rewards or levels. It only (a) picks a gentler
// reminder sentence when it is low and (b) lets the reminder pause a little sooner when it is low.

export const emptySignals = () => ({
  launches: { reminder: 0, icon: 0 }, reminderLedToRead: 0, reminderNoRead: 0, pendingReminderDay: null, uncleanExits: 0, sessionOpen: false
});
const COUNT_MAX = 99999;
const inc = n => Math.min(COUNT_MAX, (n || 0) + 1);

// At start: if the last session never closed cleanly, count one unexpected close. Then mark this one open.
export function startSession(signals) {
  return { ...signals, uncleanExits: signals.sessionOpen ? inc(signals.uncleanExits) : signals.uncleanExits, sessionOpen: true };
}
// A clean close (the page is hidden or left).
export const endSession = signals => (signals.sessionOpen ? { ...signals, sessionOpen: false } : signals);

// How Beacon was opened. reclassify: the app said "reminder" just after this start was counted as an icon.
export function recordLaunch(signals, source, today, { reclassify = false } = {}) {
  const launches = { ...signals.launches };
  if (source === 'reminder') {
    launches.reminder = inc(launches.reminder);
    if (reclassify && launches.icon > 0) launches.icon -= 1;
    return { ...signals, launches, pendingReminderDay: today };
  }
  launches.icon = inc(launches.icon);
  return { ...signals, launches };
}

// Settles a reminder opening: led to a finished text that day, or not (known once the day is over).
export function settleReminder(signals, readDays, today) {
  const day = signals.pendingReminderDay;
  if (!day) return signals;
  if (readDays.has(day)) return { ...signals, reminderLedToRead: inc(signals.reminderLedToRead), pendingReminderDay: null };
  if (day !== today) return { ...signals, reminderNoRead: inc(signals.reminderNoRead), pendingReminderDay: null };
  return signals;
}

export const SCORE_LOW = 0.3;
export const PAUSE_AFTER_LOW = 5;
const clamp01 = x => Math.max(0, Math.min(1, x));

// A simple fixed rule, no learning. Four parts, each 0 to 1, weighted and added:
// - recency, weight 0.4: 1 on a reading day, falling evenly to 0 at 14 days since the last reading day
//   (0.5 when nothing has been read yet);
// - volume, weight 0.25: texts finished in the last 14 days, 6 or more counts as 1;
// - ease, weight 0.15: 1 minus the share of wrong answers in the last 5 texts (0.5 with no texts);
// - reminder help, weight 0.2: the share of reminder openings that led to a finished text that day
//   (0.5 until there are 3 settled reminder openings).
// Rounded to two places. Higher means the reader comes back easily.
export function comeBackScore(learner, settings, today) {
  const l = learner || {};
  const quests = (l.quests || []).filter(q => q && typeof q.at === 'string');
  const recency = l.lastReadingDay ? clamp01(1 - daysBetween(l.lastReadingDay, today) / 14) : 0.5;
  const recent = quests.filter(q => { const d = daysBetween(localDay(q.at), today); return d >= 0 && d < 14; }).length;
  const volume = clamp01(recent / 6);
  const last = quests.slice(-5);
  const asked = last.reduce((n, q) => n + (q.of || 0), 0);
  const ease = asked ? clamp01(last.reduce((n, q) => n + (q.right || 0), 0) / asked) : 0.5;
  const s = (settings && settings.signals) || emptySignals();
  const settled = s.reminderLedToRead + s.reminderNoRead;
  const help = settled >= 3 ? s.reminderLedToRead / settled : 0.5;
  return Math.round(clamp01(0.4 * recency + 0.25 * volume + 0.15 * ease + 0.2 * help) * 100) / 100;
}

// The reminder is for the whole device: it uses the best score among the readers.
export const deviceScore = (learners, settings, today) => (learners || []).reduce((best, l) => Math.max(best, comeBackScore(l, settings, today)), 0);

// Days in a row with no reading before the reminder pauses: 7, or 5 when the score is low. Never more.
export const pauseAfter = score => (score < SCORE_LOW ? PAUSE_AFTER_LOW : PAUSE_AFTER);
