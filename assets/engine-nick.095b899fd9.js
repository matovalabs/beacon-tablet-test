import { NICK_MAX } from './engine-constants.f6f2fc2188.js';

// One word, 1 to 20 characters, letters and a hyphen only (section 2, T2).
// Spaces, digits, symbols and emoji are refused, so a full name, an email or a phone number cannot be typed.
const NICK = /^\p{L}+(?:-\p{L}+)*$/u;

export function checkNick(raw) {
  const s = String(raw == null ? '' : raw).normalize('NFC').trim();
  if (s.length < 1) return { ok: false, reason: 'empty' };
  if ([...s].length > NICK_MAX) return { ok: false, reason: 'long' };
  if (!NICK.test(s)) return { ok: false, reason: 'shape' };
  return { ok: true, nick: s };
}

export function checkGrade(raw) {
  const g = Number(raw);
  return Number.isInteger(g) && g >= 1 && g <= 12 ? { ok: true, grade: g } : { ok: false };
}

// Two readers on one device need different nicknames, or Today and the reports cannot tell them apart.
export function nickTaken(nick, learners, exceptId) {
  const k = String(nick).normalize('NFC').toLocaleLowerCase();
  return (learners || []).some(l => l.id !== exceptId && String(l.nick).normalize('NFC').toLocaleLowerCase() === k);
}
