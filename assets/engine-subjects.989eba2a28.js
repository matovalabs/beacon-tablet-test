// School subjects. The child picks one or more before the first check-in (Ian, October 11, 2026).
// Every subject runs the same quest: one text and 8 questions, two per skill, with its own level.
// Science, social studies and the four newer subjects use the reading skills; math has its own four.
// Each subject has a grade range (logic spec section 18, Ian, November 25, 2026): a subject outside the
// learner's grade is hidden, never deleted, and its level stays inside its own range.
import { SKILL_ORDER, LEVEL_MIN, LEVEL_MAX } from './engine-constants.c67cce0f9a.js';

// Core four first, so the order a picker shows and older saved data stay as they were.
export const CORE_SUBJECTS = ['reading', 'math', 'science', 'social'];
export const SUBJECT_IDS = [...CORE_SUBJECTS, 'economics', 'government', 'money', 'accounting'];

const READING_SKILLS = {
  order: SKILL_ORDER,
  skills: ['central', 'structure', 'monitor', 'vocab'],
  tieOrder: ['monitor', 'central', 'structure', 'vocab']
};
const FULL = { minGrade: 1, maxGrade: 12, minLevel: LEVEL_MIN, maxLevel: LEVEL_MAX };

export const SUBJECTS = {
  reading: {
    id: 'reading', label: 'Reading', guide: 'pip', guideName: 'Pip', questWord: 'reading', prefix: 'L', ...FULL,
    order: SKILL_ORDER,
    skills: ['central', 'structure', 'monitor', 'vocab'],
    tieOrder: ['monitor', 'central', 'structure', 'vocab']
  },
  math: {
    id: 'math', label: 'Math', guide: 'tally', guideName: 'Tally', questWord: 'math', prefix: 'M', ...FULL,
    order: ['number', 'operations', 'problem', 'problem', 'check', 'number', 'operations', 'check'],
    skills: ['number', 'operations', 'problem', 'check'],
    tieOrder: ['check', 'problem', 'operations', 'number']
  },
  science: {
    id: 'science', label: 'Science', guide: 'fizz', guideName: 'Fizz', questWord: 'science', prefix: 'S', ...FULL, ...READING_SKILLS
  },
  social: {
    id: 'social', label: 'Social studies', guide: 'atlas', guideName: 'Atlas', questWord: 'social studies', prefix: 'H', ...FULL, ...READING_SKILLS
  },
  economics: {
    id: 'economics', label: 'Economics', guide: 'marlo', guideName: 'Marlo', questWord: 'economics', prefix: 'E',
    minGrade: 1, maxGrade: 12, minLevel: 1, maxLevel: 12, ...READING_SKILLS
  },
  government: {
    id: 'government', label: 'Government', guide: 'juno', guideName: 'Juno', questWord: 'government', prefix: 'G',
    minGrade: 3, maxGrade: 12, minLevel: 3, maxLevel: 12, ...READING_SKILLS
  },
  // Money and Accounting share one guide, Ivy.
  money: {
    id: 'money', label: 'Money', guide: 'ivy', guideName: 'Ivy', questWord: 'money', prefix: 'F',
    minGrade: 1, maxGrade: 12, minLevel: 1, maxLevel: 12, ...READING_SKILLS
  },
  accounting: {
    id: 'accounting', label: 'Accounting', guide: 'ivy', guideName: 'Ivy', questWord: 'accounting', prefix: 'A',
    minGrade: 9, maxGrade: 12, minLevel: 9, maxLevel: 12, ...READING_SKILLS
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

// Whether a subject fits a grade. Unknown subjects never fit.
export function subjectFits(id, grade) {
  const S = SUBJECTS[id];
  const g = Number.isInteger(grade) ? grade : 1;
  return !!S && g >= S.minGrade && g <= S.maxGrade;
}

// The subjects a picker offers for a grade: those that fit and exist in this build, core four first.
export function offeredSubjects(grade, available = SUBJECT_IDS) {
  return SUBJECT_IDS.filter(id => available.includes(id) && subjectFits(id, grade));
}

// A level kept inside a subject's own range (Accounting stays at 9 to 12, Government at 3 to 12).
export function clampSubjectLevel(id, n) {
  const S = SUBJECTS[id] || SUBJECTS.reading;
  return Math.min(S.maxLevel, Math.max(S.minLevel, n));
}

// The subjects the learner picked that fit the grade, in the order picked. Reading when none is left.
// A picked subject outside the grade stays saved with its level and quests; it is only hidden here.
export function learnerSubjects(learner) {
  const s = (learner.subjects || []).filter(id => SUBJECT_IDS.includes(id) && subjectFits(id, learner.grade));
  return s.length ? s : ['reading'];
}

// Picked subjects hidden because they do not fit the grade (for the grown-up's one fixed sentence).
export function hiddenSubjects(learner) {
  return (learner.subjects || []).filter(id => SUBJECT_IDS.includes(id) && !subjectFits(id, learner.grade));
}

export function hasCheckinFor(learner, subject) {
  return (learner.quests || []).some(q => q.kind === 'checkin' && (q.subject || 'reading') === subject);
}

// The first picked subject that still needs its check-in, or null.
export function nextCheckin(learner) {
  return learnerSubjects(learner).find(s => !hasCheckinFor(learner, s)) || null;
}
