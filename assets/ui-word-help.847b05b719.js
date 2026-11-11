// The word helper. A child taps a dotted word (or selects any word) in the text and a card opens:
// 1. "What does this mean?" The child guesses from three short meanings, or says "Not sure yet".
// 2. Then: the word in syllables, a plain respelling, the recorded voice saying it (and slowly, with the
//    syllables lighting up), a student-friendly meaning, the sentence from the text, words like it,
//    word parts, and for early readers one phonics tip.
// The design rules and their evidence are in docs/literacy-evidence.md. Nothing the child picks or
// selects is stored: the quest keeps only a count of helper taps (section 8 of the logic spec).
import { h, icon, clear } from './ui-dom.43bde315e2.js';
import { button, character } from './ui-common.4acae333f8.js';
import { WORDS } from './text-copy.5e71bb1047.js';
import { openLayer, closeLayer } from './ui-layer.bb980036ff.js';

let player = null;

export function voiceOn(app) {
  return !!(app.store.state.settings && app.store.state.settings.voice);
}

function play(file, { rate = 1, onTime = null, onEnd = null } = {}) {
  if (!file) return;
  if (player) { player.pause(); player = null; }
  const a = new Audio(`assets/audio/${file}`);
  a.playbackRate = rate;
  a.preservesPitch = true;
  if (onTime) a.addEventListener('timeupdate', () => onTime(a.currentTime, a.duration));
  a.addEventListener('ended', () => { if (onEnd) onEnd(); if (player === a) player = null; });
  player = a;
  a.play().catch(() => { if (onEnd) onEnd(); });
}

export function stopVoice() { if (player) { player.pause(); player = null; } }

// Glossary entries for a passage. Falls back to the passage's own vocab list if none exist yet.
export function glossaryFor(app, passage) {
  const g = app.data.GLOSSARY && app.data.GLOSSARY[passage.id];
  if (g && g.length) return g;
  return passage.vocab.map(v => ({ w: v.w, syl: [v.w], say: '', pos: v.pos, def: v.def, ex: v.ex, syn: [], a: null, m: null }));
}

function index(entries) {
  const map = new Map();
  for (const e of entries) for (const f of [e.w, ...(e.forms || [])]) map.set(f.toLowerCase(), e);
  return map;
}

// The passage text with every glossary word as a button. Selecting any other word offers help too.
export function passageBody(app, passage, onWord) {
  const entries = glossaryFor(app, passage);
  const map = index(entries);
  const keys = [...map.keys()].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = keys.length ? new RegExp(`\\b(${keys.join('|')})\\b`, 'gi') : null;
  const asked = h('div', { class: 'select-ask', role: 'status', 'aria-live': 'polite' });
  const body = h('div', { class: 'passage', 'data-region': 'passage' },
    passage.text.map(par => {
      const p = h('p');
      let last = 0;
      if (re) for (const m of par.matchAll(re)) {
        p.append(par.slice(last, m.index));
        const e = map.get(m[0].toLowerCase());
        p.append(h('button', { class: 'word', type: 'button', 'aria-haspopup': 'dialog', title: WORDS.askLabel, onclick: () => onWord(e) }, m[0]));
        last = m.index + m[0].length;
      }
      p.append(par.slice(last));
      return p;
    }));
  // Selecting a word: offer "What does it mean?" for it. The selection is read only to match a word.
  const check = () => {
    const sel = window.getSelection ? window.getSelection() : null;
    const t = sel && body.contains(sel.anchorNode) ? sel.toString().trim().replace(/[^A-Za-z'-]/g, '') : '';
    clear(asked);
    if (!t || /\s/.test(sel.toString().trim())) return;
    const e = map.get(t.toLowerCase());
    if (e) asked.append(button(WORDS.askAbout(t), () => { clear(asked); onWord(e); }, 'pill ask-btn'));
    else asked.append(h('p', { class: 'muted small', text: WORDS.notInList }));
  };
  for (const ev of ['mouseup', 'touchend', 'keyup']) body.addEventListener(ev, () => setTimeout(check, 30));
  // A long press on a tablet selects without a touchend on the text, so also follow selectionchange.
  // The listener removes itself once this text leaves the screen.
  let timer = 0;
  const onSel = () => {
    if (!body.isConnected) { document.removeEventListener('selectionchange', onSel); return; }
    clearTimeout(timer);
    timer = setTimeout(check, 250);
  };
  document.addEventListener('selectionchange', onSel);
  return h('div', {}, body, asked);
}

// Three short meanings for the guess, in a fixed order: the right one and two others from this text.
function choicesFor(entry, entries) {
  const others = entries.filter(e => e !== entry && e.def !== entry.def);
  const score = s => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7);
  others.sort((a, b) => score(entry.w + a.w) - score(entry.w + b.w));
  const list = [entry.def, ...others.slice(0, 2).map(e => e.def)];
  const spin = score(entry.w) % list.length;
  return [...list.slice(spin), ...list.slice(0, spin)];
}

function speakBtn(app, label, file, opts) {
  if (!voiceOn(app) || !file) return null;
  return h('button', { class: 'btn pill speak', type: 'button', onclick: () => play(file, opts) }, icon('sound'), label);
}

// The card. onClose is called by "Got it". Used in a dialog, and inline inside Look back.
export function wordCard(app, passage, entry, onClose, { guide = 'pip' } = {}) {
  if (app.run) { app.run.telemetry.helperTap(entry.w); app.run.wordsExplored = (app.run.wordsExplored || 0) + 1; }
  const entries = glossaryFor(app, passage);
  const grade = app.learner().grade;
  const wrap = h('div', { class: 'helper' });
  const head = h('div', { class: 'helper-head' },
    h('div', {}, h('p', { class: 'eyebrow', text: WORDS.eyebrow }), h('h2', { class: 'helper-word', text: entry.w }), entry.pos ? h('p', { class: 'muted', text: entry.pos }) : null),
    character(guide, 'think', grade, { decorative: true, cls: 'helper-pip' }));

  const learn = (said = '') => {
    clear(wrap);
    const chips = (entry.syl || [entry.w]).map(s => h('span', { class: 'syl', text: s }));
    const lightUp = i => chips.forEach((c, k) => c.classList.toggle('on', k === i));
    const slow = voiceOn(app) && entry.a ? h('button', {
      class: 'btn pill speak', type: 'button',
      onclick: () => play(entry.a, {
        rate: 0.7,
        onTime: (t, d) => { if (d) lightUp(Math.min(chips.length - 1, Math.floor((t / d) * chips.length))); },
        onEnd: () => lightUp(-1)
      })
    }, icon('sound'), WORDS.sayItSlowly) : null;
    const sec = (title, ...kids) => h('div', { class: 'helper-sec' }, h('h3', { class: 'helper-h', text: title }), ...kids);
    wrap.append(...[head,
      said ? h('p', { class: 'msg guess-said', role: 'status', text: said }) : null,
      sec(WORDS.soundItOut,
        h('p', { class: 'syls', 'aria-label': WORDS.syllablesLabel(entry.syl.length) }, chips),
        // Respellings help older readers; early readers see the real spelling and syllables only.
        entry.say && grade >= 3 ? h('p', { class: 'say-it' }, h('span', { class: 'muted', text: WORDS.sayIt + ' ' }), h('strong', { text: entry.say })) : null,
        h('div', { class: 'speak-row' }, speakBtn(app, WORDS.hearIt, entry.a), slow),
        // One phonics tip for early readers (grades 1 to 4), when the entry has one.
      entry.pattern && grade <= 4 ? h('p', { class: 'tip' }, h('strong', { text: WORDS.soundTip + ' ' }), entry.pattern) : null),
      sec(WORDS.whatItMeans,
        h('p', { class: 'helper-def', text: entry.def }),
        h('div', { class: 'speak-row' }, speakBtn(app, WORDS.hearMeaning, entry.m)),
        h('p', { class: 'helper-ex' }, h('strong', { text: WORDS.fromText + ' ' }), `"${entry.ex}"`)),
      entry.syn && entry.syn.length ? sec(WORDS.wordsLikeThis, h('ul', { class: 'syn' }, entry.syn.map(s => h('li', { text: s })))) : null,
      entry.ant && entry.ant.length ? sec(WORDS.opposites, h('ul', { class: 'syn ant' }, entry.ant.map(s => h('li', { text: s })))) : null,
      entry.parts && entry.parts.length ? sec(WORDS.wordParts, h('ul', { class: 'parts' }, entry.parts.map(pt => h('li', {}, h('strong', { text: pt.part }), ` ${WORDS.partMeans} ${pt.meaning}`)))) : null,
      button(WORDS.gotIt, () => { stopVoice(); onClose(); }, 'dark block', { 'data-autofocus': true })].filter(Boolean));
    // Start at the top of the card: focus the word (not the button at the bottom) without scrolling.
    const word = wrap.querySelector('.helper-word');
    if (word) { word.setAttribute('tabindex', '-1'); word.focus({ preventScroll: true }); }
    const d = wrap.closest('dialog');
    if (d) d.scrollTop = 0; else wrap.scrollIntoView({ block: 'nearest' });
  };

  // Step 1: guess first, kindly. Any pick moves on to the full card.
  const choices = choicesFor(entry, entries);
  if (choices.length < 2) { learn(); return wrap; }
  const msg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
  const promptFile = app.data.PROMPT_AUDIO && app.data.PROMPT_AUDIO['What does this mean?'];
  const pick = d => {
    const ok = d === entry.def;
    const line = ok ? 'Nice thinking. Here is what it means.' : 'Good try. Here is what it means.';
    if (voiceOn(app)) play(app.data.PROMPT_AUDIO && app.data.PROMPT_AUDIO[line]);
    learn(line);
  };
  wrap.append(head,
    h('div', { class: 'guess' },
      h('div', { class: 'row-between' }, h('h3', { class: 'helper-h', text: WORDS.whatDoesItMean }), speakBtn(app, WORDS.hearQuestion, promptFile)),
      h('p', { class: 'muted small', text: WORDS.guessHint }),
      h('div', { class: 'guess-list' }, choices.map(d => h('button', { class: 'guess-choice', type: 'button', onclick: () => pick(d) }, d))),
      button(WORDS.notSure, () => learn(), 'text'),
      msg));
  return wrap;
}

export function openWordHelp(app, passage, entry, opts = {}) {
  {
    const d = h('dialog', { class: 'sheet light word-sheet', 'aria-label': `${WORDS.eyebrow}: ${entry.w}` });
    d.append(wordCard(app, passage, entry, () => closeLayer(), opts));
    d.addEventListener('close', () => { stopVoice(); closeLayer(); });
    openLayer(d);
    const f = d.querySelector('.guess-choice, [data-autofocus]'); if (f) f.focus();
  }
}
