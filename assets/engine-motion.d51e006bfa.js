// Guide motion in code, version 0.9 (logic spec section 17.2). Pure: no DOM, no clock, no randomness of its own.
// Times come in as numbers and randomness as a function that returns 0 up to (not including) 1.
// The page (src/ui/guide-motion.js) turns these plans into transform and opacity changes only.

// The guide's moods. rest, happy, cheer and welcome come from guideMood (engine/retention.js); think is the
// word helper's listening look.
export const MOODS = ['rest', 'happy', 'cheer', 'welcome', 'think'];

// The prepared drawing each mood shows. No new art: the three existing drawings.
export const MOOD_DRAWING = { rest: 'idle', happy: 'idle', cheer: 'cheer', welcome: 'cheer', think: 'think' };
export const DRAWINGS = ['idle', 'cheer', 'think'];

// Each mood's pose, laid over the drawing: a stretch (height, about the feet) and a lean (degrees). Small on
// purpose, and nothing lifts: the pose pivots on the ground under the feet, so the feet stay down. In a scene
// (section 17) only the stretch is used, because a lean there must turn about one foot.
export const MOOD_POSE = {
  rest: { stretch: 1, lean: 0 },
  happy: { stretch: 1.02, lean: 0 },
  cheer: { stretch: 1.04, lean: 0 },
  welcome: { stretch: 1.03, lean: 3 },
  think: { stretch: 1, lean: -3 }
};

// Allowed transitions and how long each blend takes (ms). Moods that are far apart pass through a middle mood
// (for example rest to cheer goes rest, happy, cheer), so a change is always one small blend at a time.
export const TRANSITIONS = {
  rest: { happy: 280, think: 320 },
  happy: { rest: 360, cheer: 260, welcome: 300, think: 320 },
  cheer: { happy: 360 },
  welcome: { happy: 360, cheer: 260 },
  think: { rest: 320, happy: 300 }
};
export const BLEND_MIN_MS = 200;
export const BLEND_MAX_MS = 400;

export const isMood = m => MOODS.includes(m);

// The shortest list of allowed blends from one mood to another: [{ from, to, ms }]. Empty when they are the
// same. An unknown mood is treated as rest.
export function moodRoute(from, to) {
  const a = isMood(from) ? from : 'rest';
  const b = isMood(to) ? to : 'rest';
  if (a === b) return [];
  const prev = { [a]: null };
  const queue = [a];
  while (queue.length) {
    const m = queue.shift();
    if (m === b) break;
    for (const n of Object.keys(TRANSITIONS[m])) if (!(n in prev)) { prev[n] = m; queue.push(n); }
  }
  if (!(b in prev)) return [];
  const steps = [];
  for (let m = b; prev[m] !== null; m = prev[m]) steps.unshift({ from: prev[m], to: m, ms: TRANSITIONS[prev[m]][m] });
  return steps;
}

// The state machine. A state is { mood, from, to, start, steps }: at rest it has no steps. go() starts a blend
// to a new mood at time now (ms); at() says where the blend is at a later time.
export function moodState(mood = 'rest') {
  return { mood: isMood(mood) ? mood : 'rest', steps: [], start: 0 };
}

export function go(state, to, now) {
  // A change mid-blend starts from the mood the blend is heading to, so it never jumps backwards.
  const cur = at(state, now);
  const from = cur.done ? cur.mood : cur.to;
  return { mood: from, steps: moodRoute(from, to), start: now };
}

// Where the blend is: { mood (settled mood so far), from, to, t (0 to 1, eased), done }.
export function at(state, now) {
  let t0 = state.start;
  let mood = state.mood;
  for (const s of state.steps) {
    if (now < t0 + s.ms) return { mood, from: s.from, to: s.to, t: ease(Math.max(0, (now - t0) / s.ms)), done: false };
    t0 += s.ms;
    mood = s.to;
  }
  return { mood, from: mood, to: mood, t: 1, done: true };
}

export const totalMs = state => state.steps.reduce((n, s) => n + s.ms, 0);

// Ease in and out, so a blend starts and lands softly.
export const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

// The pose part way through a blend, and how visible each drawing is (they cross-fade).
export function blendPose(from, to, t) {
  const a = MOOD_POSE[isMood(from) ? from : 'rest'], b = MOOD_POSE[isMood(to) ? to : 'rest'];
  const mix = k => +(a[k] + (b[k] - a[k]) * t).toFixed(4);
  const show = Object.fromEntries(DRAWINGS.map(d => [d, 0]));
  show[MOOD_DRAWING[isMood(from) ? from : 'rest']] += 1 - t;
  show[MOOD_DRAWING[isMood(to) ? to : 'rest']] += t;
  return { stretch: mix('stretch'), lean: mix('lean'), show };
}

// Blinks: a quick close and open, at uneven times so it never looks like a clock. Sometimes two in a row.
export const BLINK = { minGap: 2200, maxGap: 6400, closeMs: 110, doubleChance: 0.2, doubleGap: 160 };

// The next blink: how long to wait (ms) and whether it is a double blink. random() returns 0 up to 1.
export function nextBlink(random) {
  const r = clamp01(random());
  // Two draws averaged lean toward the middle of the range, as real blinks do, but any gap is possible.
  const r2 = clamp01(random());
  const wait = Math.round(BLINK.minGap + ((r + r2) / 2) * (BLINK.maxGap - BLINK.minGap));
  return { wait, double: clamp01(random()) < BLINK.doubleChance };
}

// Breathing: a slow, small rise of the body about its base.
export const BREATH = { ms: 3600, scale: 1.015 };

// The mouth with the recorded voice. 0 closed, 1 a little open, 2 open. Driven by loudness (the root mean
// square of the sound, 0 to 1) from the page's own audio, with a little hysteresis so it does not flutter.
export const MOUTH = { open1: 0.035, open2: 0.11, close: 0.02 };

export function mouthFromLevel(level, prev = 0) {
  const v = Number.isFinite(level) ? level : 0;
  if (v >= MOUTH.open2) return 2;
  if (v >= MOUTH.open1) return 1;
  if (prev > 0 && v >= MOUTH.close) return 1; // stay a little open until it is really quiet
  return 0;
}

// The fallback when loudness cannot be read (no Web Audio): a simple open and close while the voice plays,
// from the audio's own playing time (ms). One cycle is 400 ms: a little open, open, a little open, closed.
export const MOUTH_CYCLE = [[0, 1], [110, 2], [210, 1], [290, 0]];
export const MOUTH_CYCLE_MS = 400;

export function timedMouth(ms, playing = true) {
  if (!playing || !Number.isFinite(ms) || ms < 0) return 0;
  const p = ms % MOUTH_CYCLE_MS;
  let shape = 0;
  for (const [from, s] of MOUTH_CYCLE) if (p >= from) shape = s;
  return shape;
}

// Where motion may run. Never on the reading and question screens (route "quest"), except the word helper's
// mouth while its recorded voice plays. Always off when the grown-up turns movement off or the device asks
// for reduced motion.
export const QUEST_ROUTES = ['quest'];
export function motionAllowed({ motion = false, reduced = false, route = '', part = 'scene', voicePlaying = false } = {}) {
  // Ian, November 25, 2026: the helper's mouth keeps moving with the voice even with movement off or reduced
  // motion. It is a small shape swap tied to speech, not decoration.
  if (part === 'helper-mouth') return voicePlaying;
  if (!motion || reduced) return false;
  if (QUEST_ROUTES.includes(route)) return part === 'helper-mouth' && voicePlaying;
  if (part === 'helper-mouth') return voicePlaying;
  return true;
}

function clamp01(x) {
  const n = Number(x);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n >= 1 ? 0.999999 : n;
}
