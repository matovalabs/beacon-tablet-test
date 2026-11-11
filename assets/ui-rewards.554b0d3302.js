// Coming back (logic spec section 19): the weekly goal on Today, the card after a quest or check-in,
// and Lumi's cliff with the keepsake shelf. Every reward is earned by reading; nothing is lost by a gap.
import { h } from './ui-dom.43bde315e2.js';
import { screen, topbar, button } from './ui-common.4acae333f8.js';
import { stage, build } from './ui-stage.b19732b10d.js';
import { keepsakeTree } from './ui-scenes.44831deef9.js';
import { RETENTION } from './text-copy.5e71bb1047.js';
import { weekGoal, todaysKeepsake, shelf, path } from './engine-retention.44d90a9335.js';

export const keepsakeIcon = (id, cls = 'keepsake') => build(keepsakeTree(id, cls));

export function weekCard(app) {
  const l = app.learner();
  const now = app.clock.nowIso();
  const g = weekGoal(l, now);
  const found = todaysKeepsake(l, now);
  return h('section', { class: 'card week', 'aria-labelledby': 'week-title' },
    h('h2', { class: 'eyebrow', id: 'week-title', text: RETENTION.weekTitle }),
    h('div', { class: 'week-row' },
      h('ol', { class: 'week-dots', 'aria-hidden': 'true' }, Array.from({ length: g.goal }, (_, i) => h('li', { class: i < g.days ? 'on' : null }))),
      h('p', { class: 'strong', text: g.met ? RETENTION.weekMet : RETENTION.weekDays(g.days, g.goal) })),
    h('p', { class: 'muted small', text: `${RETENTION.total(l.readingDays || 0)}. ${RETENTION.weekHint}` }),
    found
      ? h('p', { class: 'keepsake-line' }, keepsakeIcon(found), RETENTION.keepsakeToday(RETENTION.keepsakeNames[found]))
      : h('p', { class: 'muted small', text: RETENTION.keepsakeHint }),
    button(RETENTION.pathOpen, () => app.go('path'), 'secondary block'));
}

// What the text just finished earned. stop: also say that the child can stop here.
export function rewardsCard(app, { stop = true } = {}) {
  const r = app.lastRewards || { keepsake: null, unlocked: [] };
  if (!stop && !r.keepsake && !r.unlocked.length) return null;
  return h('div', { class: 'card rewards' },
    r.keepsake ? h('p', { class: 'keepsake-line' }, keepsakeIcon(r.keepsake), RETENTION.foundKeepsake(RETENTION.keepsakeNames[r.keepsake])) : null,
    r.unlocked.map(id => h('p', { class: 'strong', text: RETENTION.newOnCliff(RETENTION.itemNames[id]) })),
    stop ? h('p', { text: RETENTION.stopHere }) : null);
}

export function cliff(app) {
  const l = app.learner();
  const p = path(l);
  const kept = shelf(l);
  return screen('child',
    topbar(RETENTION.pathTitle, { onBack: () => app.go('today') }),
    h('h1', { text: RETENTION.pathTitle }),
    h('p', { class: 'lead', text: RETENTION.pathLead }),
    stage(app, 'lumi', { walk: false, cls: 'cliff-stage' }),
    h('p', { class: 'strong', text: RETENTION.pathDone(p.done) }),
    h('p', { text: p.next ? RETENTION.pathNext(RETENTION.itemNames[p.next.id], p.next.left) : RETENTION.pathAll }),
    p.unlocked.length ? h('ul', { class: 'chips' }, p.unlocked.map(id => h('li', { class: 'chip', text: RETENTION.itemNames[id] }))) : null,
    h('h2', { text: RETENTION.shelfTitle }),
    kept.length
      ? h('ul', { class: 'shelf' }, kept.map(k => h('li', {}, keepsakeIcon(k.id), h('span', { text: RETENTION.keepsakeNames[k.id] }), k.count > 1 ? h('span', { class: 'shelf-count', text: `${k.count} found` }) : null)))
      : h('p', { class: 'muted', text: RETENTION.shelfNone }));
}
