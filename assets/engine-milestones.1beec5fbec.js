// Milestones: small recognitions of effort and progress. No streaks, no ranks, nothing lost by
// skipping a day. Each one is earned once. The wording lives in src/text/copy.js (MILESTONES).
import { SUBJECT_IDS } from './engine-subjects.b9c5ff3bf4.js';

const subjectOf = q => q.subject || 'reading';
const sum = (qs, f) => qs.reduce((n, q) => n + q.rows.reduce((m, r) => m + f(r), 0), 0);

// Every milestone id this learner has reached, in a fixed order.
export function reached(learner) {
  const qs = learner.quests || [];
  const out = [];
  if (qs.some(q => q.kind === 'checkin')) out.push('first-checkin');
  for (const s of SUBJECT_IDS) {
    if (qs.some(q => q.kind === 'quest' && subjectOf(q) === s)) out.push(`first-quest-${s}`);
    // A check-in sets the starting point; only a quest can raise a level.
    if (qs.some(q => q.kind === 'quest' && subjectOf(q) === s && q.levelEnd > q.levelStart)) out.push(`level-up-${s}`);
  }
  const questCount = qs.filter(q => q.kind === 'quest').length;
  for (const n of [5, 10, 25, 50]) if (questCount >= n) out.push(`quests-${n}`);
  if (sum(qs, r => r.lookedBack) >= 3) out.push('look-back-3');
  for (const n of [10, 25, 50]) if ((learner.wordsExplored || 0) >= n) out.push(`words-${n}`);
  if (new Set(qs.map(subjectOf)).size >= 2) out.push('two-subjects');
  return out;
}

// The milestones that are new since the learner last saved them.
export function newMilestones(learner) {
  const have = new Set((learner.milestones || []).map(m => m.id));
  return reached(learner).filter(id => !have.has(id));
}

export function award(learner, atIso) {
  const fresh = newMilestones(learner);
  if (!fresh.length) return { learner, fresh };
  return { learner: { ...learner, milestones: [...(learner.milestones || []), ...fresh.map(id => ({ id, at: atIso }))] }, fresh };
}
