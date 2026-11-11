// Choosing the next text: logic spec section 5, step by step.
// chooseNext is pure: no clock, no randomness, no global state, and it never changes the learner.
import { LEVEL_MIN, LEVEL_MAX, NEAR_LEVELS, MAX_QUESTS } from './engine-constants.f6f2fc2188.js';
import { activeTopics, interestForTopic } from './engine-topics.a6ddd9fc2b.js';
import { bankFor, learnerSubjects } from './engine-subjects.b9c5ff3bf4.js';

// The learner's level in one subject. A subject with no level yet starts at the grade, clamped to 1 to 12.
export function levelOf(learner, subject) {
  const v = learner.levels && learner.levels[subject];
  return Number.isInteger(v) ? v : Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, learner.grade || LEVEL_MIN));
}

export function activeSubject(learner) {
  const list = learnerSubjects(learner);
  return list.includes(learner.subject) ? learner.subject : list[0];
}

// The number of the next quest: one more than the highest saved, so it keeps rising after old quests
// are dropped at the 200 quest cap or to free storage (sections 3 and 5).
export function nextQuestNumber(learner) {
  return (learner.quests || []).reduce((m, q) => Math.max(m, Number.isInteger(q.n) ? q.n : 0), 0) + 1;
}

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

// Step 1 to 3: the topics to try, target first.
export function topicOrder(learner, n, topicMap) {
  const active = activeTopics(learner, topicMap);
  const lessUntil = learner.topicLessUntil || {};
  // Step 2: drop "Less like this" topics while n <= topicLessUntil[topic].
  let allowed = active.filter(t => !(lessUntil[t] !== undefined && n <= lessUntil[t]));
  // Section 6.5: if every active topic is skipped, ignore the skips for this choice.
  if (allowed.length === 0) allowed = active;
  const lastUsed = learner.topicLastUsed || {};
  const sorted = [...allowed].sort((a, b) => ((lastUsed[a] || 0) - (lastUsed[b] || 0)) || (allowed.indexOf(a) - allowed.indexOf(b)));
  // Step 3: the first "More like this" topic still allowed (oldest tap first) is the target.
  const more = (learner.topicMore || []).find(t => allowed.includes(t));
  return more ? [more, ...sorted.filter(t => t !== more)] : sorted;
}

export function chooseNext(learner, n, fullBank, topicMap, subject = activeSubject(learner)) {
  const bank = bankFor(fullBank, subject);
  const L = levelOf(learner, subject);
  const seen = new Set(learner.seen || []);
  const unseen = bank.filter(p => !seen.has(p.id));
  const pick = (topic, level) => unseen.filter(p => (topic === null || p.topic === topic) && p.level === level).sort(byId)[0];
  const order = topicOrder(learner, n, topicMap);

  let passage = null;
  // Step 4.1 to 4.3: each topic in order at L, then L - 1, then L + 1.
  for (const t of order) {
    for (const lv of [L, L - 1, L + 1]) {
      if (lv < LEVEL_MIN || lv > LEVEL_MAX) continue;
      passage = pick(t, lv);
      if (passage) break;
    }
    if (passage) break;
  }
  // Step 4.4: any topic at L.
  if (!passage) passage = pick(null, L);
  // Step 4.5: any topic at the nearest unseen level, ties to the lower level.
  for (let d = 1; !passage && d <= NEAR_LEVELS; d++) {
    for (const lv of [L - d, L + d]) {
      if (lv < LEVEL_MIN || lv > LEVEL_MAX) continue;
      passage = pick(null, lv);
      if (passage) break;
    }
  }
  let repeat = false;
  // Step 5: everything near is seen. The least recently seen passage at L (or the nearest level that has any).
  if (!passage) {
    repeat = true;
    const order2 = learner.seen || [];
    for (let d = 0; !passage && d <= LEVEL_MAX; d++) {
      for (const lv of d === 0 ? [L] : [L - d, L + d]) {
        const atLevel = bank.filter(p => p.level === lv);
        if (!atLevel.length) continue;
        atLevel.sort((a, b) => (order2.indexOf(a.id) - order2.indexOf(b.id)) || byId(a, b));
        passage = atLevel[0];
        break;
      }
    }
  }
  if (!passage) return null;
  const interestId = order.includes(passage.topic) ? interestForTopic(learner, passage.topic, topicMap) : null;
  return {
    passageId: passage.id,
    passage,
    topic: passage.topic,
    interestId,
    // Section 6.4: when no chosen interest names this text, Today says "A mix today".
    mixed: interestId === null,
    fromMore: (learner.topicMore || []).includes(passage.topic),
    repeat,
    subject
  };
}

// The only place the learner changes after a quest: section 5 step 6.
export function applyFinishedQuest(learner, quest) {
  const seen = (learner.seen || []).filter(id => id !== quest.passageId);
  seen.push(quest.passageId);
  return {
    ...learner,
    levels: { ...learner.levels, [quest.subject || 'reading']: quest.levelEnd },
    topicLastUsed: { ...learner.topicLastUsed, [quest.topic]: quest.n },
    topicMore: (learner.topicMore || []).filter(t => t !== quest.topic),
    seen,
    quests: [...(learner.quests || []), quest].slice(-MAX_QUESTS)
  };
}
