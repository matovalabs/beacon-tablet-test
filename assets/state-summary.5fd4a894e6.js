// Copy summary: the one way anything can leave the device, and only by the parent's own hand
// (logic spec section 12). No nickname, no free text, grade band only, days since the first session.
// The same function feeds the preview box and the clipboard write, so the two are always identical.
import { bandForGrade, bandLabel } from './engine-interests.7dd0456ab8.js';
import { skillTotals, SKILL_NAMES, skillsFor, formatTime, times, chars } from './text-report-text.b1d09bb2dc.js';
import { subjectFor, learnerSubjects } from './engine-subjects.b9c5ff3bf4.js';
import { levelOf } from './engine-select.dcc6fcf48a.js';

export const SUMMARY_FIRST_LINE = 'Beacon test summary, shared by a parent on their own choice.';

// Whole days between two saved dates, counted on the device's own calendar.
function dayNumber(iso, firstIso) {
  const day = s => { const d = new Date(s); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); };
  return Math.max(0, Math.round((day(iso) - day(firstIso)) / 86400000));
}

function skillsText(rows, subject) {
  const t = skillTotals(rows, subject);
  return skillsFor(subject).map(s => `${SKILL_NAMES[s].toLowerCase()} ${t[s].right} of ${t[s].of}`).join(', ');
}

export function exportSummary(learner) {
  const quests = learner.quests || [];
  const lines = [SUMMARY_FIRST_LINE];
  lines.push(`Grade band: ${bandLabel(bandForGrade(learner.grade))}.`);
  lines.push(`Quests finished: ${quests.length}.`);
  const levelsLine = `Current levels: ${learnerSubjects(learner).map(s => `${subjectFor(s).label.toLowerCase()} ${levelOf(learner, s)}`).join(', ')}.`;
  if (!quests.length) return [...lines, levelsLine].join('\n');
  const first = quests[0].at;
  for (const q of quests) {
    const a = q.attention;
    lines.push(
      `Day ${dayNumber(q.at, first)}, ${subjectFor(q.subject).label.toLowerCase()} ${q.kind === 'checkin' ? 'check-in' : 'quest'}${q.repeat ? ' (repeat text)' : ''}: ` +
      `${q.right} of ${q.of} right, level ${q.levelStart} to ${q.levelEnd}. ` +
      `Skills: ${skillsText(q.rows, q.subject)}. ` +
      `Left the app ${times(a.awayCount)}, ${formatTime(a.awayMs)} away. Copied ${times(a.copyCount)}. Pasted ${times(a.pasteCount)}, ${chars(a.pasteChars)}.`
    );
  }
  for (const s of learnerSubjects(learner)) {
    const rows = quests.filter(q => (q.subject || 'reading') === s).flatMap(q => q.rows);
    if (rows.length) lines.push(`${subjectFor(s).label} skill totals: ${skillsText(rows, s)}.`);
  }
  const sum = k => quests.reduce((n, q) => n + q.attention[k], 0);
  lines.push(`Attention totals: left the app ${times(sum('awayCount'))}, ${formatTime(sum('awayMs'))} away, copied ${times(sum('copyCount'))}, pasted ${times(sum('pasteCount'))} (${chars(sum('pasteChars'))}).`);
  lines.push(levelsLine);
  return lines.join('\n');
}
