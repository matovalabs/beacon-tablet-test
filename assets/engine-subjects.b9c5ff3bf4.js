// School subjects. The child picks one or more before the first check-in (Ian, October 11, 2026).
// Every subject runs the same quest: one text and 8 questions, two per skill, with its own level.
// Science and social studies use the reading skills; math has its own four.
import { SKILL_ORDER } from './engine-constants.f6f2fc2188.js';

export const SUBJECT_IDS = ['reading', 'math', 'science', 'social'];

export const SUBJECTS = {
  reading: {
    id: 'reading', label: 'Reading', guide: 'pip', guideName: 'Pip', questWord: 'reading',
    order: SKILL_ORDER,
    skills: ['central', 'structure', 'monitor', 'vocab'],
    tieOrder: ['monitor', 'central', 'structure', 'vocab']
  },
  math: {
    id: 'math', label: 'Math', guide: 'tally', guideName: 'Tally', questWord: 'math',
    order: ['number', 'operations', 'problem', 'problem', 'check', 'number', 'operations', 'check'],
    skills: ['number', 'operations', 'problem', 'check'],
    tieOrder: ['check', 'problem', 'operations', 'number']
  },
  science: {
    id: 'science', label: 'Science', guide: 'fizz', guideName: 'Fizz', questWord: 'science',
    order: SKILL_ORDER,
    skills: ['central', 'structure', 'monitor', 'vocab'],
    tieOrder: ['monitor', 'central', 'structure', 'vocab']
  },
  social: {
    id: 'social', label: 'Social studies', guide: 'atlas', guideName: 'Atlas', questWord: 'social studies',
    order: SKILL_ORDER,
    skills: ['central', 'structure', 'monitor', 'vocab'],
    tieOrder: ['monitor', 'central', 'structure', 'vocab']
  }
};

export const ALL_SKILLS = ['central', 'structure', 'monitor', 'vocab', 'number', 'operations', 'problem', 'check'];

export function subjectOf(passage) {
  return passage && passage.subject ? passage.subject : 'reading';
}

export function subjectFor(id) {
  return SUBJECTS[id] || SUBJECTS.reading;
}

export function bankFor(bank, subject) {
  return bank.filter(p => subjectOf(p) === subject);
}

// The subjects the learner picked, in the order picked. Reading when nothing was picked.
export function learnerSubjects(learner) {
  const s = (learner.subjects || []).filter(id => SUBJECT_IDS.includes(id));
  return s.length ? s : ['reading'];
}

export function hasCheckinFor(learner, subject) {
  return (learner.quests || []).some(q => q.kind === 'checkin' && (q.subject || 'reading') === subject);
}

// The first picked subject that still needs its check-in, or null.
export function nextCheckin(learner) {
  return learnerSubjects(learner).find(s => !hasCheckinFor(learner, s)) || null;
}
