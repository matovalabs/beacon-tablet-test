import { INTEREST_MIN, INTEREST_MAX, MAX_INTEREST_LOG, LESS_SKIP_QUESTS } from './engine-constants.f6f2fc2188.js';

export function bandForGrade(grade) {
  const g = Number(grade);
  if (g <= 2) return 'grades-1-2';
  if (g <= 5) return 'grades-3-5';
  if (g <= 8) return 'grades-6-8';
  return 'grades-9-12';
}

export function bandLabel(band) {
  return { 'grades-1-2': '1 to 2', 'grades-3-5': '3 to 5', 'grades-6-8': '6 to 8', 'grades-9-12': '9 to 12' }[band];
}

export function bandList(interests, grade) {
  return interests.bands[bandForGrade(grade)] || [];
}

// Picking: 3 to 5 tiles, or Surprise me. A 6th tile is refused.
export function canAdd(picked) {
  return picked.length < INTEREST_MAX;
}

export function pickStatus(picked) {
  if (picked.length < INTEREST_MIN) return { ok: false, reason: 'few' };
  if (picked.length > INTEREST_MAX) return { ok: false, reason: 'many' };
  return { ok: true };
}

export function toggle(picked, id) {
  if (picked.includes(id)) return picked.filter(x => x !== id);
  if (!canAdd(picked)) return picked;
  return [...picked, id];
}

// Returns a new learner. A change applies to the next quest and is logged.
export function setInterests(learner, ids, surprise, atIso) {
  const from = learner.surprise ? [] : [...learner.interests];
  const to = surprise ? [] : [...ids];
  const same = from.length === to.length && from.every((x, i) => x === to[i]) && !!learner.surprise === !!surprise;
  if (same && learner.interestLog.length) return learner;
  const interestLog = [...learner.interestLog, { at: atIso, from, to }].slice(-MAX_INTEREST_LOG);
  return { ...learner, interests: to, surprise: !!surprise, interestLog };
}

// More like this: the topic is used next, once.
export function moreLikeThis(learner, topic) {
  if (learner.topicMore.includes(topic)) return learner;
  return { ...learner, topicMore: [...learner.topicMore, topic] };
}

// Less like this: skipped for the next 3 quests after quest n.
export function lessLikeThis(learner, topic, n) {
  return { ...learner, topicLessUntil: { ...learner.topicLessUntil, [topic]: n + LESS_SKIP_QUESTS } };
}

// Grade change: the level is untouched. Interests that exist in the new band are kept by id.
export function changeGrade(learner, grade, interests, atIso) {
  const list = bandList(interests, grade).map(x => x.id);
  const kept = learner.interests.filter(id => list.includes(id));
  let next = { ...learner, grade };
  if (kept.length !== learner.interests.length) next = setInterests(next, kept, learner.surprise || kept.length === 0, atIso);
  return next;
}
