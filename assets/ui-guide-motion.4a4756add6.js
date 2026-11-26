// Guide motion in the page, version 0.9 (logic spec section 17.2): idle blinks, mood blends and the word
// helper's mouth with the recorded voice. Like a Rive state machine, but in code: no package, no new art.
// The plans come from src/engine/motion.js; here they only switch classes, data attributes and one CSSOM
// custom property (--mood-ms), so the stylesheet moves things with transform and opacity only.
// Nothing here runs on the reading and question screens, except the helper's mouth while its voice plays,
// and nothing runs when the grown-up turns movement off or the device asks for reduced motion.
import { h, s } from './ui-dom.43bde315e2.js';
import { characterSrc } from './ui-common.47dcda4ccf.js';
import { bandForGrade } from './engine-interests.ccd1f09d5a.js';
import { MOOD_DRAWING, DRAWINGS, moodRoute, nextBlink, BLINK, mouthFromLevel, timedMouth, motionAllowed, isMood } from './engine-motion.d51e006bfa.js';
import { mouthTree } from './ui-mouth-art.dcdefd8f1b.js';

const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export function allowed(app, part, extra = {}) {
  const st = app && app.store && app.store.state;
  const r = app && app.route ? app.route() : null;
  return motionAllowed({ motion: !!(st && st.settings && st.settings.motion), reduced: reducedMotion(), route: r ? r.name : '', part, ...extra });
}

const tree = node => {
  const [tag, attrs, ...kids] = node;
  return s(tag, attrs, kids.filter(Boolean).map(tree));
};

// A guide that can change mood: the drawings it needs, stacked, inside a pose layer. Starts at mood.
export function moodFigure(guide, mood, grade, { cls = '' } = {}) {
  const m = isMood(mood) ? mood : 'rest';
  return h('span', { class: `mood-fig ${cls}`.trim(), 'aria-hidden': 'true', dataset: { mood: m } },
    h('span', { class: 'mood-pose' },
      DRAWINGS.map(d => h('img', {
        class: `mood-art${MOOD_DRAWING[m] === d ? ' on' : ''}`, src: characterSrc(guide, d, grade), alt: '',
        width: 200, height: 240, decoding: 'async', dataset: { art: d }
      }))));
}

// The new drawing goes on top and fades in while the old one fades out a little later, so the guide never
// looks see-through half way.
function show(fig, mood) {
  fig.setAttribute('data-mood', mood);
  for (const img of fig.querySelectorAll('.mood-art')) {
    const on = img.getAttribute('data-art') === MOOD_DRAWING[mood];
    if (on && !img.classList.contains('on')) img.parentNode.appendChild(img);
    img.classList.toggle('on', on);
  }
}

// Blends a mood figure (in the page or inside a scene) to a new mood, one allowed transition at a time.
// With motion not allowed it changes at once. A new call replaces a blend that is still running.
const pending = new WeakMap();
export function setMood(app, fig, to, { delay = 0 } = {}) {
  if (!fig || !isMood(to)) return;
  clearTimeout(pending.get(fig));
  const animate = allowed(app, 'mood');
  const run = () => {
    const from = fig.getAttribute('data-mood') || 'rest';
    const steps = animate ? moodRoute(from, to) : [{ from, to, ms: 0 }];
    const next = i => {
      if (i >= steps.length || (i > 0 && !fig.isConnected)) return;
      fig.style.setProperty('--mood-ms', `${steps[i].ms}ms`);
      show(fig, steps[i].to);
      if (i + 1 < steps.length) pending.set(fig, setTimeout(() => next(i + 1), steps[i].ms));
    };
    next(0);
  };
  if (animate && delay) pending.set(fig, setTimeout(run, delay)); else run();
}

// Idle blinks on a rigged guide in a scene: the eyes close for a moment at uneven times, sometimes twice.
// Stops by itself once the scene leaves the screen. Breathing is in the stylesheet (actor-breathe).
export function startBlinks(app, root) {
  if (!root || !allowed(app, 'blink')) return;
  const close = () => { root.classList.add('blink'); setTimeout(() => root.classList.remove('blink'), BLINK.closeMs); };
  const tick = () => {
    if (!root.isConnected) return;
    const b = nextBlink(Math.random);
    if (allowed(app, 'blink') && root.querySelector('.eye')) {
      close();
      if (b.double) setTimeout(close, BLINK.closeMs + BLINK.doubleGap);
    }
    setTimeout(tick, b.wait);
  };
  setTimeout(tick, nextBlink(Math.random).wait);
}

// The word helper's guide: the think drawing with the prepared mouth shapes over it (src/ui/mouth-art.js).
// data-mouth is 0 (closed, the drawing's own mouth), 1 (a little open) or 2 (open).
export function talker(guide, grade, cls = '') {
  const t = mouthTree(guide, bandForGrade(grade || 4));
  return h('span', { class: `talker ${cls}`.trim(), 'aria-hidden': 'true', dataset: { mouth: '0' } },
    h('img', { class: 'talker-art', src: characterSrc(guide, 'think', grade), alt: '', width: 200, height: 240, decoding: 'async' }),
    t ? tree(t) : null);
}

// Loudness from the page's own audio element, with the Web Audio API. No network, no microphone, no new
// permission: the sound only passes through an analyser on its way to the speaker. One context is reused.
// The voice must never go silent because of this, so the analyser is used only when the context is already
// running; otherwise the timed fallback moves the mouth and the context is resumed for next time.
let audioCtx = null;
function analyserFor(audio) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    // iPhone and iPad: let the voice play with the ring switch off, as the plain audio element does.
    if (!audioCtx && navigator.audioSession) { try { navigator.audioSession.type = 'playback'; } catch (e) { /* older WebKit */ } }
    audioCtx = audioCtx || new AC();
    if (audioCtx.state !== 'running') { audioCtx.resume().catch(() => {}); return null; }
    const src = audioCtx.createMediaElementSource(audio);
    const an = audioCtx.createAnalyser();
    an.fftSize = 1024;
    an.smoothingTimeConstant = 0.5;
    src.connect(an);
    an.connect(audioCtx.destination);
    return an;
  } catch (e) {
    return null;
  }
}

function loudness(an, buf) {
  if (an.getFloatTimeDomainData) {
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  }
  const b = new Uint8Array(an.fftSize);
  an.getByteTimeDomainData(b);
  let sum = 0;
  for (let i = 0; i < b.length; i++) { const v = (b[i] - 128) / 128; sum += v * v; }
  return Math.sqrt(sum / b.length);
}

// Moves a talker's mouth while one audio element plays. Call it before audio.play(). Returns a stop function.
// The mouth moves even under the movement setting or reduced motion (Ian, November 25, 2026); it is tied to speech.
export function mouthWith(app, audio, el) {
  if (!el || !allowed(app, 'helper-mouth', { voicePlaying: true })) return () => {};
  const an = analyserFor(audio);
  const buf = an ? new Float32Array(an.fftSize) : null;
  let shape = 0, raf = 0, stopped = false;
  el.setAttribute('data-sync', an ? 'loudness' : 'timed');
  const set = m => { if (m !== shape) { shape = m; el.setAttribute('data-mouth', String(m)); } };
  const frame = () => {
    if (stopped) return;
    const playing = !audio.paused && !audio.ended;
    let m = 0;
    if (playing && el.isConnected && allowed(app, 'helper-mouth', { voicePlaying: true })) {
      m = an ? mouthFromLevel(loudness(an, buf), shape) : timedMouth(audio.currentTime * 1000, true);
    }
    set(m);
    raf = requestAnimationFrame(frame);
  };
  const stop = () => { stopped = true; cancelAnimationFrame(raf); set(0); };
  audio.addEventListener('ended', stop);
  audio.addEventListener('pause', stop);
  audio.addEventListener('error', stop);
  raf = requestAnimationFrame(frame);
  return stop;
}
