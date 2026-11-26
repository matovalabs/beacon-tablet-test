// The island (logic spec section 19, version 0.7): a small dark pill fixed at the top center of the child's
// screens, with the subject guide's face and one short status. Tap or keyboard opens it into a panel with
// this week, the total reading days, today's keepsake, the guide's mood and a way to Lumi's cliff.
// On reading and question screens it is a static count that never opens and never moves. After a quest
// it may open once, on the summary, for about 2.5 seconds to show what the text earned.
// Motion is transform and opacity only, with CSS transitions so a tap can reverse it mid-way.
import { h } from './ui-dom.43bde315e2.js';
import { characterSrc } from './ui-common.47dcda4ccf.js';
import { RETENTION, QUESTION } from './text-copy.a37af2a234.js';
import { weekGoal, todaysKeepsake, localDay, guideMood, MOOD_ART, path } from './engine-retention.c576d6d48c.js';
import { activeSubject } from './engine-select.db0462b2de.js';
import { subjectFor } from './engine-subjects.ac0d8dc3f3.js';
import { QUEST_QUESTIONS } from './engine-constants.3213d107a9.js';
import { keepsakeIcon } from './ui-rewards.9a85c3a757.js';
import { markTree } from './ui-season-art.1512571c02.js';
import { lookToday, build } from './ui-stage.36ac09a807.js';

const SHOWN_ON = ['today', 'path', 'milestones', 'my-interests', 'quest', 'summary', 'start'];
const PEEK_DELAY_MS = 400;
const PEEK_MS = 2500;

let peekTimers = [];
let listening = false;

const host = () => document.getElementById('island');

// Called when a quest (not a check-in) is finished: the summary screen may open the island once.
export function peekIsland(app, kind) {
  app.islandPeek = kind === 'quest' ? { ...(app.lastRewards || { keepsake: null, unlocked: [] }) } : null;
}

function stopPeek() {
  for (const t of peekTimers) clearTimeout(t);
  peekTimers = [];
}

function dots(g, cls = 'island-dots') {
  return h('span', { class: cls, 'aria-hidden': 'true' },
    Array.from({ length: g.goal }, (_, i) => h('span', { class: i < g.days ? 'dot on' : 'dot' })));
}

function face(guide, mood, grade, cls = 'island-face') {
  return h('img', { class: cls, src: characterSrc(guide, MOOD_ART[mood], grade), alt: '', width: 200, height: 240, decoding: 'async' });
}

// Opens or closes. Measures the pill and the panel first, so the panel's backdrop starts exactly at the
// pill's size and grows from its top center (origin-aware), then shrinks back to it.
function setOpen(app, open, { focusPill = false } = {}) {
  const el = host();
  if (!el) return;
  const pill = el.querySelector('.island-pill');
  const panel = el.querySelector('.island-panel');
  if (!pill || !panel || pill.tagName !== 'BUTTON') return;
  const w = panel.offsetWidth || 1;
  const hgt = panel.offsetHeight || 1;
  el.style.setProperty('--island-sx', (pill.offsetWidth / w).toFixed(4));
  el.style.setProperty('--island-sy', (pill.offsetHeight / hgt).toFixed(4));
  app.islandOpen = open;
  el.classList.toggle('open', open);
  pill.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (focusPill) pill.focus();
}

function listen(app) {
  if (listening) return;
  listening = true;
  document.addEventListener('pointerdown', e => {
    const el = host();
    if (app.islandOpen && el && !el.contains(e.target)) { stopPeek(); setOpen(app, false); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && app.islandOpen) { stopPeek(); setOpen(app, false, { focusPill: true }); }
  });
}

// The season's or a chosen holiday's tiny mark (section 17). Decorative; never on reading or question screens.
function seasonMark(app) {
  const look = lookToday(app);
  const t = look ? markTree(look.id) : null;
  return t ? build(t) : null;
}

// Reading and question screens: a static count, no button, no movement. The top bar already says the same
// to a screen reader, so this copy is hidden from it.
function quietPill(app, l) {
  const run = app.run;
  const guide = subjectFor(run ? run.subject : activeSubject(l)).guide;
  const status = run && (run.phase === 'question' || run.phase === 'feedback') ? QUESTION.progress(run.qi + 1, QUEST_QUESTIONS) : RETENTION.islandReading;
  return h('div', { class: 'island' },
    h('div', { class: 'island-pill quiet', 'aria-hidden': 'true' }, face(guide, 'rest', l.grade), h('span', { class: 'island-status', text: status })));
}

function panelLines(app, l, guide, guideName, mood, peek) {
  const now = app.clock.nowIso();
  const g = weekGoal(l, now);
  const found = todaysKeepsake(l, now);
  const earned = peek ? [
    peek.keepsake ? h('p', { class: 'island-earned' }, keepsakeIcon(peek.keepsake, 'keepsake island-keepsake'), RETENTION.foundKeepsake(RETENTION.keepsakeNames[peek.keepsake])) : null,
    ...peek.unlocked.map(id => h('p', { class: 'island-earned', text: RETENTION.newOnCliff(RETENTION.itemNames[id]) })),
    !peek.keepsake && !peek.unlocked.length ? h('p', { class: 'island-earned', text: RETENTION.pathDone(path(l).done) }) : null
  ] : [];
  return h('div', { class: 'island-content' },
    h('div', { class: 'island-guide' }, face(guide, mood, l.grade, 'island-guide-art'), h('p', { class: 'island-mood', text: RETENTION.mood[mood](guideName) })),
    earned,
    h('div', { class: 'island-week' }, dots(g, 'island-dots big'), h('p', { class: 'island-strong', text: RETENTION.islandWeekLong(g.days, g.goal) })),
    h('p', { class: 'island-muted', text: RETENTION.total(l.readingDays || 0) }),
    found && !(peek && peek.keepsake) ? h('p', { class: 'island-keepsake-line' }, keepsakeIcon(found, 'keepsake island-keepsake'), RETENTION.keepsakeToday(RETENTION.keepsakeNames[found])) : null,
    app.route().name === 'path' ? null : h('button', { class: 'btn island-cliff', type: 'button', onclick: () => { stopPeek(); setOpen(app, false); app.go('path'); } }, RETENTION.pathOpen));
}

export function renderIsland(app, routeName) {
  const el = host();
  if (!el) return;
  stopPeek();
  const l = app.store.state.consent ? app.learner() : null;
  const show = !!l && SHOWN_ON.includes(routeName) && document.body.classList.contains('child');
  el.replaceChildren();
  el.classList.remove('open', 'quiet-host');
  app.islandOpen = false;
  document.body.classList.toggle('has-island', show);
  el.hidden = !show;
  if (!show) return;
  listen(app);

  if (routeName === 'quest') {
    el.classList.add('quiet-host');
    el.append(quietPill(app, l));
    return;
  }

  const S = subjectFor(activeSubject(l));
  const today = localDay(app.clock.nowIso());
  const mood = guideMood(l, today);
  const g = weekGoal(l, app.clock.nowIso());
  const peek = routeName === 'summary' && app.islandPeek ? app.islandPeek : null;
  app.islandPeek = null;

  const pill = h('button', {
    class: 'island-pill', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'island-panel',
    onclick: () => { stopPeek(); setOpen(app, !app.islandOpen); }
  },
  face(S.guide, mood, l.grade),
  seasonMark(app),
  dots(g),
  h('span', { class: 'island-status', 'aria-hidden': 'true', text: RETENTION.islandWeek(g.days, g.goal) }),
  h('span', { class: 'sr-only', text: RETENTION.islandWeekLong(g.days, g.goal) }));
  const panel = h('div', { class: 'island-panel', id: 'island-panel', role: 'region', 'aria-label': RETENTION.islandLabel },
    h('div', { class: 'island-bg', 'aria-hidden': 'true' }),
    panelLines(app, l, S.guide, S.guideName, mood, peek));
  const live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
  el.append(h('div', { class: 'island' }, pill, panel), live);

  if (peek) {
    const note = [
      peek.keepsake ? RETENTION.foundKeepsake(RETENTION.keepsakeNames[peek.keepsake]) : null,
      ...peek.unlocked.map(id => RETENTION.newOnCliff(RETENTION.itemNames[id]))
    ].filter(Boolean).join(' ') || RETENTION.pathDone(path(l).done);
    peekTimers.push(setTimeout(() => { setOpen(app, true); live.textContent = note; }, PEEK_DELAY_MS));
    peekTimers.push(setTimeout(() => setOpen(app, false), PEEK_DELAY_MS + PEEK_MS));
  }
}
