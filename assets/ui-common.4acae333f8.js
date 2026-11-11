// Pieces shared by several screens.
import { h, icon } from './ui-dom.43bde315e2.js';
import { bandForGrade } from './engine-interests.7dd0456ab8.js';
import { openLayer, closeLayer } from './ui-layer.bb980036ff.js';

// Alt text from the character bible, section 8.
const ALT = {
  pip: {
    idle: "Pip, a teal-green puffin in a navy captain's cap, stands calmly holding a brass spyglass.",
    cheer: 'Pip, the puffin, lifts both wings with eyes squeezed into happy arcs and his spyglass held high.',
    think: 'Pip, the puffin, looks up and to the side with one eyebrow raised and a wing resting at his chin.',
    oops: 'Pip, the puffin, tilts his head and scratches under his cap with a small wry look: a tricky one, not a problem.'
  },
  lumi: {
    idle: 'Lumi, a red-and-white striped lighthouse with a glowing lantern for a face, smiles with bright open eyes.',
    cheer: 'Lumi, the lighthouse, throws her arms up with happy closed eyes and a wide smile as her lantern glows brighter.',
    think: 'Lumi, the lighthouse, looks up and to the side with one eyebrow raised and a hand near her chin.',
    oops: 'Lumi, the lighthouse, tilts and raises both eyebrows with a small wry smile: a tricky one, not a problem.'
  },
  tally: {
    idle: 'Tally, a violet hermit crab with eyes on stalks, carries a pink shell marked with three counting dots.',
    cheer: 'Tally, the hermit crab, waves both claws in the air with happy closed eyes and an open smile.',
    think: 'Tally, the hermit crab, looks up and to the side with one eyebrow raised and a claw pressed to her front.',
    oops: 'Tally, the hermit crab, tilts and scratches her head with one claw and a small wry smile: a tricky one, not a problem.'
  },
  fizz: {
    idle: 'Fizz, a lime-green sea turtle with lab goggles pushed up on his forehead, holds a flask of bright blue liquid.',
    cheer: 'Fizz, the sea turtle, holds up his flask with bubbles floating out, eyes in happy arcs and a big smile.',
    think: 'Fizz, the sea turtle, pulls his goggles down over his eyes and looks up and to the side, one eyebrow raised.',
    oops: 'Fizz, the sea turtle, scratches his head with a small puff of smoke from his flask and a wry smile: an experiment step, not a failure.'
  },
  atlas: {
    idle: 'Atlas, a brown sea otter with a brass compass around his neck, stands holding a rolled map.',
    cheer: 'Atlas, the sea otter, holds an unrolled map with a dotted path and an X above his head, eyes in happy arcs.',
    think: 'Atlas, the sea otter, looks up and to the side with one eyebrow raised and a flipper at his chin.',
    oops: 'Atlas, the sea otter, scratches his head with one flipper and a small wry smile: a wrong turn, not a problem.'
  }
};

// The art file for a guide in a mood, in the style for the reader's grade.
export const characterSrc = (who, mood, grade) => `assets/art/${bandForGrade(grade || 4)}/${who}-${mood}.svg`;

export function character(who, mood, grade, { decorative = false, cls = '' } = {}) {
  return h('img', {
    class: `char char-${who} ${cls}`.trim(),
    src: characterSrc(who, mood, grade),
    alt: decorative ? '' : ALT[who][mood],
    width: 200, height: 240, decoding: 'async'
  });
}

export function screen(theme, ...kids) {
  return h('section', { class: `screen ${theme}`, dataset: { theme } }, ...kids);
}

export function eyebrow(text) { return h('p', { class: 'eyebrow', text }); }

export function topbar(label, { onBack = null, progress = null } = {}) {
  const bar = h('div', { class: 'topbar' },
    onBack ? h('button', { class: 'btn icon-btn', type: 'button', 'aria-label': 'Back', onclick: onBack }, icon('back')) : null,
    h('div', { class: 'topbar-main' },
      h('p', { class: 'topbar-label', text: label }),
      progress !== null ? progressBar(progress, label) : null));
  return bar;
}

export function progressBar(fraction, label) {
  const fill = h('span', { class: 'bar-fill' });
  fill.style.setProperty('--p', `${Math.round(Math.max(0, Math.min(1, fraction)) * 1000) / 10}%`);
  return h('div', { class: 'bar', role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(fraction * 100) }, fill);
}

export function button(text, onclick, cls = 'primary', extra = {}) {
  return h('button', { class: `btn ${cls}`, type: 'button', onclick, ...extra }, text);
}

// A modal confirmation built on <dialog>. Resolves true or false.
export function confirmDialog(title, body, yes, no) {
  return new Promise(resolve => {
    const done = v => { closeLayer(); resolve(v); };
    const d = h('dialog', { class: 'sheet', 'aria-labelledby': 'confirm-title' },
      h('h2', { id: 'confirm-title', text: title }),
      body ? h('p', { text: body }) : null,
      h('div', { class: 'row-2' },
        button(no, () => done(false), 'secondary'),
        button(yes, () => done(true), 'danger')));
    d.addEventListener('cancel', e => { e.preventDefault(); done(false); });
    openLayer(d);
  });
}

// Shows the saved date on the device's own calendar.
export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Before any check-in the child is still in onboarding. Later subjects get their check-in from Today.
export function hasCheckin(learner) {
  return !!learner && learner.quests.some(q => q.kind === 'checkin');
}

export function interestLabel(app, id) {
  for (const list of Object.values(app.data.INTERESTS.bands)) {
    const f = list.find(x => x.id === id);
    if (f) return f.label;
  }
  return null;
}

export function topicLabel(app, topic) {
  return app.data.TOPIC_MAP.labels[topic] || topic;
}

export function passageTitle(app, id) {
  const p = app.data.BANK.find(x => x.id === id);
  return p ? p.title : 'A text that is no longer in the bank';
}
