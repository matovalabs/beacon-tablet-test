import { LEVEL_MIN, LEVEL_MAX, UP_AT, DOWN_BELOW } from './engine-constants.f6f2fc2188.js';

export function clampLevel(n) {
  return Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, n));
}

// The check-in starts at the learner's grade, clamped to 1 to 12.
export function startLevel(grade) {
  return clampLevel(Math.round(Number(grade) || LEVEL_MIN));
}

// up, hold or down from accuracy alone. Flags never reach this function.
export function outcome(level, right, of) {
  const acc = right / of;
  if (acc >= UP_AT) return 'up';
  if (acc < DOWN_BELOW) return 'down';
  return 'hold';
}

export function nextLevel(level, right, of) {
  const o = outcome(level, right, of);
  return clampLevel(level + (o === 'up' ? 1 : o === 'down' ? -1 : 0));
}
