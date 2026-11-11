// Guides in their home scenes, and the short celebration clips (made ahead of time, saved with the page).
// Movement appears only between questions: Today, onboarding, starting point and quest summary.
// It stops when the grown-up turns movement off or the device asks for reduced motion.
import { h, s } from './ui-dom.43bde315e2.js';
import { character, characterSrc, button } from './ui-common.4acae333f8.js';
import { sceneTree, HOME } from './ui-scenes.cbf3c1f2c5.js';
import { openLayer, closeLayer } from './ui-layer.bb980036ff.js';
import { CELEBRATE } from './text-copy.5e71bb1047.js';
import { path } from './engine-retention.44d90a9335.js';
import { bandForGrade } from './engine-interests.7dd0456ab8.js';

export function motionOn(app) {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !!(app.store.state.settings && app.store.state.settings.motion) && !reduced;
}

export function build(node) {
  const [tag, attrs, ...kids] = node;
  return s(tag, attrs, kids.filter(Boolean).map(build));
}

// A scene with its guide standing on its ground. walk: the guide goes to its spot and back, one beat at a time
// (step, stop, gesture, turn), with its own gait; otherwise it stands still. Lumi is a lighthouse: she never moves,
// her beam is drawn from her lantern, and her cliff shows the items the reader has unlocked on her path.
// The grades 6 to 8 drawings are round badges with no feet on the ground, so they stand still too.
export function stage(app, guide, { mood = 'idle', walk = true, cls = '' } = {}) {
  const l = app.learner();
  const grade = l ? l.grade : 4;
  const moving = motionOn(app);
  const planted = !walk || guide === 'lumi' || bandForGrade(grade) === 'grades-6-8';
  const actor = { src: characterSrc(guide, mood, grade), beam: guide === 'lumi', guide };
  return h('div', { class: `stage ${moving ? 'moving' : 'still'} ${planted ? 'planted' : `walking gait-${guide}`} ${cls}`.replace(/\s+/g, ' ').trim() },
    build(sceneTree(HOME[guide] || 'harbor', guide === 'lumi' && l ? path(l).unlocked : [], actor)));
}

export function hasClip(app, id) {
  return !!(app.data.MEDIA && app.data.MEDIA[id]);
}

// A short silent clip that plays once. With movement off it shows the still first frame instead.
export function clip(app, id, cls = 'clip') {
  if (!hasClip(app, id)) return null;
  if (!motionOn(app)) return h('img', { class: cls, src: `assets/media/${id}.jpg`, alt: '', width: 480, height: 480 });
  const v = h('video', { class: cls, src: `assets/media/${id}.mp4`, poster: `assets/media/${id}.jpg`, muted: true, playsinline: true, autoplay: true, preload: 'auto', 'aria-hidden': 'true', disablepictureinpicture: true });
  v.muted = true;
  return v;
}

// The celebration card: a clip (or the cheer drawing), a title and a few lines. Closed by one button.
export function celebrate(app, { clipId, guide = 'lumi', title, lines = [] }) {
  const grade = app.learner() ? app.learner().grade : 4;
  const media = clip(app, clipId, 'celebrate-clip') || character(guide, 'cheer', grade, { decorative: true, cls: 'celebrate-char' });
  const d = h('dialog', { class: 'sheet celebrate', 'aria-labelledby': 'cel-title' },
    h('div', { class: 'celebrate-media' }, media),
    h('h2', { id: 'cel-title', text: title }),
    lines.map(t => h('p', { text: t })),
    button(CELEBRATE.keepGoing, () => closeLayer(), 'primary block', { 'data-autofocus': true }));
  d.addEventListener('cancel', () => closeLayer());
  openLayer(d);
  const f = d.querySelector('[data-autofocus]'); if (f) f.focus();
}
