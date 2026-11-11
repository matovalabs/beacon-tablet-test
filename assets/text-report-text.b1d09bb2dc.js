// Every sentence in the parent report: logic spec section 10, copied from the main kit's
// 06-parent-reports.md sections 5, 6 and 12. Fixed text only. Nothing here is generated.
// Pronouns: the nickname, or "they". Never "he" or "she".
import { outcome } from './engine-levels.3311cee783.js';
import { LONG_ABSENCE_MS, LEVEL_MAX, LEVEL_MIN, STRONG_AT } from './engine-constants.f6f2fc2188.js';
import { subjectFor } from './engine-subjects.b9c5ff3bf4.js';

export const SKILL_NAMES = {
  central: 'Central idea',
  structure: 'Text structure',
  monitor: 'Monitor and clarify',
  vocab: 'Vocabulary',
  number: 'Number sense',
  operations: 'Operations',
  problem: 'Word problems',
  check: 'Check and explain'
};
// Report order of skills (main kit 06 section 6.2 item 3). Math has its own four.
export const SKILL_REPORT_ORDER = ['central', 'structure', 'monitor', 'vocab'];
export const skillsFor = subject => subjectFor(subject).skills;

// The spec template reads "from the {{element_word}}" with element words that already start
// with "the", so we use "from {{element_word}}" to avoid "the the".
export const ELEMENT_WORDS = { passage: 'the passage', question: 'a question', choice: 'the answer choices', other: 'the page' };

export const HONEST_NOTE = 'This is a signal, not proof. A phone call, a notification or a sibling can cause it.';
export const SUSPECT_LINE = 'Timing for some questions could not be confirmed, so these counts may be incomplete.';
export const ROW_SUSPECT = 'Timing could not be confirmed';
export const ROW_HELPER = 'Used the word helper on this word';
export const ROW_FAST = 'Answered very fast and missed';
export const ROW_LEFT = 'Left the app';
export const ROW_LONG = 'Long break';
export const CLIPBOARD_LINE = 'Beacon does not read what is on the clipboard. It records that a paste happened and how long it was.';
export const PROGRESS_HONEST = 'This is one child over a few sessions. It shows how Beacon worked for you, not proof that it improves reading. Texts differ in difficulty, and a child can be better or worse on different days.';

export function who(nick) { return nick || 'they'; }
function Who(nick) { return nick || 'They'; }
function whose(nick) { return nick ? `${nick}'s` : 'Their'; }

export function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }
export const times = n => plural(n, 'time', 'times');
export const chars = n => plural(n, 'character', 'characters');

// "45 s", "1 min 20 s", "0 s" under half a second, "60 min+" at an hour or more (main kit 06 section 4.5).
export function formatTime(ms) {
  const s = Math.round(Math.max(0, ms) / 1000);
  if (s >= 3600) return '60 min+';
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${s % 60} s`;
}

export function headline(nick, right, of, subject = 'reading') {
  return `${Who(nick)} finished a ${subjectFor(subject).questWord} quest: ${right} of ${of} right.`;
}

export function levelCase(levelStart, levelEnd, right, of) {
  const o = outcome(levelStart, right, of);
  if (o === 'up') return levelStart >= LEVEL_MAX ? 'cap' : 'up';
  if (o === 'down') return levelStart <= LEVEL_MIN ? 'floor' : 'down';
  return 'hold';
}

export function levelSentence(nick, levelStart, levelEnd, right, of) {
  const n = levelEnd;
  switch (levelCase(levelStart, levelEnd, right, of)) {
    case 'up': return `${whose(nick)} level went up by one. ${Who(nick)} is now at level ${n}.`;
    case 'cap': return `${Who(nick)} is at the top level, level ${LEVEL_MAX}, and stays there.`;
    case 'down': return `${whose(nick)} level moved down by one to level ${n}, so the next texts are a little easier.`;
    case 'floor': return `${Who(nick)} stays at level 1.`;
    default: return `${whose(nick)} level stays at level ${n}.`;
  }
}

export function skillTotals(rows, subject = 'reading') {
  const t = {};
  for (const s of skillsFor(subject)) t[s] = { right: 0, of: 0 };
  for (const r of rows) { if (!t[r.skill]) t[r.skill] = { right: 0, of: 0 }; t[r.skill].of += 1; if (r.ok) t[r.skill].right += 1; }
  return t;
}

// The skill to work on: lowest right over total. Reading ties go monitor, central, structure, vocab;
// math ties go check, problem, operations, number. Returns null when every skill is at or above 85%.
export function focusSkill(rows, subject = 'reading') {
  const t = skillTotals(rows, subject);
  const tie = subjectFor(subject).tieOrder;
  const ratio = s => (t[s] && t[s].of ? t[s].right / t[s].of : 1);
  if (tie.every(s => ratio(s) >= STRONG_AT)) return null;
  let best = null;
  for (const s of tie) if (best === null || ratio(s) < ratio(best)) best = s;
  return best;
}

export function sayTonight(nick, rows, subject = 'reading') {
  const n = who(nick);
  if (subject === 'math') {
    switch (focusSkill(rows, 'math')) {
      case 'check': return `Ask ${n}: "How could you check that answer a different way?"`;
      case 'problem': return `Ask ${n}: "What did the problem want you to find? Which numbers mattered?"`;
      case 'operations': return `Ask ${n} to explain one problem from today out loud, one step at a time.`;
      case 'number': return `Ask ${n}: "Which number is bigger, and how can you tell?" Use two numbers from dinner.`;
      default: return `Ask ${n}: "Which problem was the most fun to solve today?"`;
    }
  }
  switch (focusSkill(rows, subject)) {
    case 'monitor': return `Ask ${n}: "Was there a spot that confused you? What did you do to fix it?"`;
    case 'central': return `Ask ${n}: "What was the text mostly about? Which detail proves it?"`;
    case 'structure': return `Ask ${n}: "Show me the word that told you the order of events."`;
    case 'vocab': return `Pick one new word from today. Ask ${n} to use it in a sentence at dinner.`;
    default: return `Ask ${n}: "Tell me the most interesting thing you read today."`;
  }
}

export function attentionLines(nick, a, rows = []) {
  const lines = [];
  const N = Who(nick);
  if (!a.awayCount && !a.copyCount && !a.pasteCount) {
    lines.push(`${N} stayed in the app, copied nothing and pasted nothing.`);
  } else {
    if (a.awayCount) lines.push(`${N} left the app ${times(a.awayCount)} for ${formatTime(a.awayMs)} in total.`);
    if (a.longestAwayMs > LONG_ABSENCE_MS) {
      const several = rows.filter(r => r.longestAwayMs > LONG_ABSENCE_MS).length > 1;
      const lead = several ? 'The longest break lasted' : 'One break lasted';
      lines.push(a.longestAwayQ
        ? `${lead} ${formatTime(a.longestAwayMs)} on question ${a.longestAwayQ}.`
        : `${lead} ${formatTime(a.longestAwayMs)} while reading or between questions.`);
    }
    if (a.copyCount) {
      const byEl = {};
      for (const e of a.copyElements) byEl[e] = (byEl[e] || 0) + 1;
      for (const e of ['passage', 'question', 'choice', 'other']) {
        if (byEl[e]) lines.push(`${N} copied text from ${ELEMENT_WORDS[e]} ${times(byEl[e])}.`);
      }
    }
    if (a.pasteCount) {
      let s = `${N} pasted ${chars(a.pasteChars)} into the brain dump.`;
      if (a.pasteShare !== null && a.pasteShare !== undefined) s += ` That was about ${a.pasteShare}% of what was submitted.`;
      lines.push(s);
    }
  }
  return lines;
}

export function limitsLine(nick) {
  const n = who(nick);
  return `Beacon cannot see other devices, books or a person sitting beside ${n}. Beacon does not read what is on the clipboard. It records that a paste happened and how long it was, not what it said. Beacon records when the app is left and for how long. It does not record what ${n} did while away.`;
}

export function rowFlags(r) {
  if (r.suspect) return [ROW_SUSPECT].concat(r.helperOnTested ? [ROW_HELPER] : []);
  const f = [];
  if (r.awayCount) f.push(r.longestAwayMs > LONG_ABSENCE_MS ? `${ROW_LEFT} (${ROW_LONG.toLowerCase()})` : ROW_LEFT);
  if (r.copy) f.push(`Copied from ${[...new Set(r.copy.elements)].map(e => ELEMENT_WORDS[e]).join(' and ')}`);
  if (r.fastMiss) f.push(ROW_FAST);
  if (r.helperOnTested) f.push(ROW_HELPER);
  return f;
}

export function interestLine(interestLabel, repeat) {
  const lines = [interestLabel ? `Interest used: ${interestLabel}.` : 'Interest used: a mix of topics.'];
  if (repeat) lines.push('This was a repeat of a text read before.');
  return lines;
}

// The whole report as plain data, in the block order of section 10.1.
export function buildReport(quest, nick, { interestLabel = null } = {}) {
  const rows = quest.rows;
  const subject = quest.subject || 'reading';
  const totals = skillTotals(rows, subject);
  return {
    subject,
    headline: headline(nick, quest.right, quest.of, subject),
    level: levelSentence(nick, quest.levelStart, quest.levelEnd, quest.right, quest.of),
    sayTonight: sayTonight(nick, rows, subject),
    skills: skillsFor(subject).filter(s => totals[s].of).map(s => ({ skill: s, name: SKILL_NAMES[s], right: totals[s].right, of: totals[s].of })),
    table: rows.map(r => ({ n: r.n, skill: SKILL_NAMES[r.skill], result: r.ok ? 'Right' : 'Missed', ok: r.ok, active: formatTime(r.activeMs), flags: rowFlags(r) })),
    attention: attentionLines(nick, quest.attention, rows),
    honestNote: HONEST_NOTE,
    interest: interestLine(interestLabel, quest.repeat),
    limits: limitsLine(nick),
    suspect: rows.some(r => r.suspect) ? SUSPECT_LINE : null
  };
}

// Every string in a report, for the banned-word and dash tests.
export function reportStrings(rep) {
  const out = [rep.headline, rep.level, rep.sayTonight, ...rep.attention, rep.honestNote, ...rep.interest, rep.limits];
  if (rep.suspect) out.push(rep.suspect);
  for (const s of rep.skills) out.push(`${s.name} ${s.right} of ${s.of}`);
  for (const r of rep.table) out.push(r.skill, r.result, r.active, ...r.flags);
  return out;
}
