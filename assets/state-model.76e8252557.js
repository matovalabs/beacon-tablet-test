// The saved model: logic spec section 3. validateState rejects any field outside it.
import { STATE_VERSION, MAX_LEARNERS, MAX_QUESTS, LEVEL_MIN, LEVEL_MAX, REMINDER_FIRST_HOUR, REMINDER_LAST_HOUR, REMINDER_DEFAULT_HOUR } from './engine-constants.f6f2fc2188.js';
import { readingDaysFrom } from './engine-retention.44d90a9335.js';
import { SUBJECT_IDS, ALL_SKILLS } from './engine-subjects.b9c5ff3bf4.js';

const KEYS = {
  state: ['version', 'consent', 'settings', 'learners', 'activeLearnerId'],
  settings: ['motion', 'voice', 'reminder'],
  reminder: ['on', 'hour'],
  milestone: ['id', 'at'],
  consent: ['at', 'noticeVersion'],
  learner: ['id', 'nick', 'grade', 'subjects', 'subject', 'levels', 'interests', 'surprise', 'interestLog', 'topicLastUsed', 'topicLessUntil', 'topicMore', 'seen', 'quests', 'milestones', 'wordsExplored', 'readingDays', 'lastReadingDay'],
  logEntry: ['at', 'from', 'to'],
  quest: ['id', 'n', 'at', 'kind', 'subject', 'passageId', 'topic', 'interestId', 'repeat', 'levelStart', 'levelEnd', 'right', 'of', 'rows', 'attention'],
  row: ['n', 'skill', 'ok', 'activeMs', 'totalMs', 'awayCount', 'awayMs', 'longestAwayMs', 'copy', 'lookedBack', 'helperTaps', 'helperOnTested', 'fastMiss', 'suspect'],
  copy: ['count', 'maxLen', 'elements'],
  attention: ['awayCount', 'awayMs', 'longestAwayMs', 'longestAwayQ', 'copyCount', 'copyElements', 'pasteCount', 'pasteChars', 'pasteShare', 'dumpChars', 'dumpSkipped', 'suspectCount']
};
export const MODEL_KEYS = KEYS;

export function emptyState() {
  return { version: STATE_VERSION, consent: null, settings: defaultSettings(), learners: [], activeLearnerId: null };
}

// Grown-up settings: movement in the scenes and the recorded voice, both on by default, and the daily
// reminder (apps only), off unless a grown-up turns it on.
export function defaultSettings() {
  return { motion: true, voice: true, reminder: { on: false, hour: REMINDER_DEFAULT_HOUR } };
}

export function newLearner(id, nick, grade) {
  return {
    id, nick, grade, subjects: [], subject: 'reading', levels: {},
    interests: [], surprise: false, interestLog: [], milestones: [], wordsExplored: 0, readingDays: 0, lastReadingDay: null,
    topicLastUsed: {}, topicLessUntil: {}, topicMore: [], seen: [], quests: []
  };
}

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isInt = v => Number.isInteger(v);
const isNum = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isStr = v => typeof v === 'string';
const isBool = v => typeof v === 'boolean';
const ELEMENTS = ['passage', 'question', 'choice', 'other'];
const SKILLS = ALL_SKILLS;

function exact(errors, where, obj, keys) {
  if (!isObj(obj)) { errors.push(`${where} must be an object`); return false; }
  for (const k of Object.keys(obj)) if (!keys.includes(k)) errors.push(`${where} has a field outside the model: ${k}`);
  for (const k of keys) if (!(k in obj)) errors.push(`${where} is missing ${k}`);
  return true;
}

function numMap(errors, where, m) {
  if (!isObj(m)) { errors.push(`${where} must be an object`); return; }
  for (const v of Object.values(m)) if (!isInt(v)) errors.push(`${where} values must be integers`);
}

function checkRow(errors, w, r) {
  if (!exact(errors, w, r, KEYS.row)) return;
  if (!isInt(r.n) || !SKILLS.includes(r.skill) || !isBool(r.ok)) errors.push(`${w} has a bad n, skill or ok`);
  for (const k of ['activeMs', 'totalMs', 'awayCount', 'awayMs', 'longestAwayMs', 'lookedBack', 'helperTaps']) if (!isNum(r[k])) errors.push(`${w}.${k} must be a number`);
  for (const k of ['helperOnTested', 'fastMiss', 'suspect']) if (!isBool(r[k])) errors.push(`${w}.${k} must be true or false`);
  if (r.copy !== null && exact(errors, `${w}.copy`, r.copy, KEYS.copy)) {
    if (!isInt(r.copy.count) || !isNum(r.copy.maxLen) || !Array.isArray(r.copy.elements) || !r.copy.elements.every(e => ELEMENTS.includes(e))) errors.push(`${w}.copy is malformed`);
  }
}

function checkAttention(errors, w, a) {
  if (!exact(errors, w, a, KEYS.attention)) return;
  for (const k of ['awayCount', 'awayMs', 'longestAwayMs', 'copyCount', 'pasteCount', 'pasteChars', 'suspectCount']) if (!isNum(a[k])) errors.push(`${w}.${k} must be a number`);
  if (a.longestAwayQ !== null && !isInt(a.longestAwayQ)) errors.push(`${w}.longestAwayQ must be a number or null`);
  if (!Array.isArray(a.copyElements) || !a.copyElements.every(e => ELEMENTS.includes(e))) errors.push(`${w}.copyElements is malformed`);
  if (a.pasteShare !== null && !isNum(a.pasteShare)) errors.push(`${w}.pasteShare must be a number or null`);
  if (a.dumpChars !== null && !isNum(a.dumpChars)) errors.push(`${w}.dumpChars must be a number or null`);
  if (!isBool(a.dumpSkipped)) errors.push(`${w}.dumpSkipped must be true or false`);
}

function checkQuest(errors, w, q) {
  if (!exact(errors, w, q, KEYS.quest)) return;
  if (!isStr(q.id) || !isInt(q.n) || !isStr(q.at) || !['checkin', 'quest'].includes(q.kind)) errors.push(`${w} has a bad id, n, at or kind`);
  if (!SUBJECT_IDS.includes(q.subject)) errors.push(`${w}.subject must be a known subject`);
  if (!isStr(q.passageId) || !isStr(q.topic) || !(q.interestId === null || isStr(q.interestId)) || !isBool(q.repeat)) errors.push(`${w} has a bad passage, topic, interest or repeat`);
  for (const k of ['levelStart', 'levelEnd']) if (!isInt(q[k]) || q[k] < LEVEL_MIN || q[k] > LEVEL_MAX) errors.push(`${w}.${k} must be ${LEVEL_MIN} to ${LEVEL_MAX}`);
  if (!isInt(q.right) || q.of !== 8 || q.right < 0 || q.right > 8) errors.push(`${w} has a bad score`);
  if (!Array.isArray(q.rows) || q.rows.length !== 8) errors.push(`${w}.rows must have 8 rows`);
  else q.rows.forEach((r, i) => checkRow(errors, `${w}.rows[${i}]`, r));
  checkAttention(errors, `${w}.attention`, q.attention);
}

function checkLearner(errors, w, l) {
  if (!exact(errors, w, l, KEYS.learner)) return;
  if (!isStr(l.id) || !isStr(l.nick) || !isInt(l.grade) || l.grade < 1 || l.grade > 12) errors.push(`${w} has a bad id, nick or grade`);
  if (!Array.isArray(l.subjects) || !l.subjects.every(x => SUBJECT_IDS.includes(x)) || new Set(l.subjects).size !== l.subjects.length) errors.push(`${w}.subjects must be a list of known subjects`);
  if (!SUBJECT_IDS.includes(l.subject)) errors.push(`${w}.subject must be a known subject`);
  if (!isObj(l.levels)) errors.push(`${w}.levels must be an object`);
  else for (const [k, v] of Object.entries(l.levels)) if (!SUBJECT_IDS.includes(k) || !isInt(v) || v < LEVEL_MIN || v > LEVEL_MAX) errors.push(`${w}.levels must map subjects to ${LEVEL_MIN} to ${LEVEL_MAX}`);
  if (!Array.isArray(l.interests) || !l.interests.every(isStr) || !isBool(l.surprise)) errors.push(`${w} has bad interests`);
  if (!Array.isArray(l.interestLog)) errors.push(`${w}.interestLog must be a list`);
  else l.interestLog.forEach((e, i) => {
    if (exact(errors, `${w}.interestLog[${i}]`, e, KEYS.logEntry) && (!isStr(e.at) || !Array.isArray(e.from) || !Array.isArray(e.to))) errors.push(`${w}.interestLog[${i}] is malformed`);
  });
  numMap(errors, `${w}.topicLastUsed`, l.topicLastUsed);
  numMap(errors, `${w}.topicLessUntil`, l.topicLessUntil);
  if (!Array.isArray(l.topicMore) || !l.topicMore.every(isStr)) errors.push(`${w}.topicMore must be a list of topics`);
  if (!Array.isArray(l.seen) || !l.seen.every(isStr)) errors.push(`${w}.seen must be a list of ids`);
  if (!Array.isArray(l.milestones)) errors.push(`${w}.milestones must be a list`);
  else l.milestones.forEach((m, i) => { if (exact(errors, `${w}.milestones[${i}]`, m, KEYS.milestone) && (!isStr(m.id) || !isStr(m.at))) errors.push(`${w}.milestones[${i}] is malformed`); });
  if (!isInt(l.wordsExplored) || l.wordsExplored < 0) errors.push(`${w}.wordsExplored must be a whole number`);
  if (!isInt(l.readingDays) || l.readingDays < 0) errors.push(`${w}.readingDays must be a whole number`);
  if (!(l.lastReadingDay === null || (isStr(l.lastReadingDay) && /^\d{4}-\d{2}-\d{2}$/.test(l.lastReadingDay)))) errors.push(`${w}.lastReadingDay must be a day or null`);
  if (!Array.isArray(l.quests) || l.quests.length > MAX_QUESTS) errors.push(`${w}.quests must be a list of at most ${MAX_QUESTS}`);
  else l.quests.forEach((q, i) => checkQuest(errors, `${w}.quests[${i}]`, q));
}

export function validateState(s) {
  const errors = [];
  if (!exact(errors, 'state', s, KEYS.state)) return { ok: false, errors };
  if (s.version !== STATE_VERSION) errors.push('unknown version');
  if (exact(errors, 'settings', s.settings, KEYS.settings)) {
    if (!isBool(s.settings.motion) || !isBool(s.settings.voice)) errors.push('settings must be true or false');
    const r = s.settings.reminder;
    if (exact(errors, 'settings.reminder', r, KEYS.reminder) && (!isBool(r.on) || !isInt(r.hour) || r.hour < REMINDER_FIRST_HOUR || r.hour > REMINDER_LAST_HOUR)) errors.push('settings.reminder is malformed');
  }
  if (s.consent !== null && exact(errors, 'consent', s.consent, KEYS.consent) && (!isStr(s.consent.at) || !isStr(s.consent.noticeVersion))) errors.push('consent is malformed');
  if (!Array.isArray(s.learners) || s.learners.length > MAX_LEARNERS) errors.push(`learners must be a list of at most ${MAX_LEARNERS}`);
  else s.learners.forEach((l, i) => checkLearner(errors, `learners[${i}]`, l));
  if (s.activeLearnerId !== null && !(Array.isArray(s.learners) && s.learners.some(l => l.id === s.activeLearnerId))) errors.push('activeLearnerId does not match a learner');
  return { ok: errors.length === 0, errors };
}

// Migration by version. Version 2 added subjects: version 1 data was all reading.
export function migrate(raw) {
  if (raw && raw.version === STATE_VERSION) return raw;
  // Version 4 added reading days (counted from the quests already saved) and the daily reminder setting.
  if (raw && raw.version === 3 && Array.isArray(raw.learners)) {
    return {
      ...raw,
      version: 4,
      settings: { ...defaultSettings(), ...(raw.settings || {}), reminder: defaultSettings().reminder },
      learners: raw.learners.map(l => ({ ...l, ...readingDaysFrom(l && l.quests) }))
    };
  }
  // Version 3 added milestones, a words-explored count and grown-up settings.
  if (raw && raw.version === 2 && Array.isArray(raw.learners)) {
    return migrate({
      ...raw,
      version: 3,
      settings: defaultSettings(),
      learners: raw.learners.map(l => ({ ...l, milestones: [], wordsExplored: 0 }))
    });
  }
  if (raw && raw.version === 1 && Array.isArray(raw.learners)) {
    return migrate({
      ...raw,
      version: 2,
      learners: raw.learners.map(l => {
        const { level, ...rest } = l || {};
        return {
          ...rest,
          subjects: ['reading'],
          subject: 'reading',
          levels: Number.isInteger(level) ? { reading: level } : {},
          quests: (rest.quests || []).map(q => ({ ...q, subject: 'reading' }))
        };
      })
    });
  }
  return null;
}
