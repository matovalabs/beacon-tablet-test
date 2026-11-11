// Hash routing: one id per screen. guard() returns the route to show instead, or null.
import { h } from './ui-dom.43bde315e2.js';
import { screen, button, confirmDialog, hasCheckin } from './ui-common.4acae333f8.js';
import { welcome, addLearner, handoff, meet, sees, subjects, interests, checkinIntro, startingPoint } from './ui-screens-onboard.1d2febe22e.js';
import { nextCheckin } from './engine-subjects.b9c5ff3bf4.js';
import { today, myInterests, who, quest, summary, startQuest, milestones } from './ui-screens-child.1492d50a67.js';
import { gate, grownup } from './ui-screens-grownup.73d04cab64.js';
import { cliff } from './ui-rewards.c58763a904.js';
import { syncReminder } from './ui-reminder.a8894c8223.js';
import { BANNERS, GROWNUP } from './text-copy.5e71bb1047.js';

function blocked(app) {
  const msg = app.store.newer ? BANNERS.newer : BANNERS.invalid;
  return screen('parent',
    h('h1', { text: 'Beacon cannot use the saved data' }),
    h('p', { text: msg }),
    h('p', { text: GROWNUP.clearBody }),
    button(GROWNUP.clearButton, async () => {
      if (!(await confirmDialog(GROWNUP.clearConfirm, GROWNUP.clearBody, GROWNUP.clearYes, GROWNUP.clearNo))) return;
      app.store.clearAll();
      syncReminder(app);
      app.go('welcome');
    }, 'danger'));
}

function noBank() {
  return screen('parent', h('h1', { text: BANNERS.noBank }), h('p', { text: 'Nothing was changed. Please tell the person who sent you the link.' }));
}

export const routes = {
  blocked, 'no-texts': noBank,
  welcome, add: addLearner, handoff, meet, sees, subjects, interests,
  checkin: app => checkinIntro(app, startQuest),
  start: startingPoint,
  today, 'my-interests': myInterests, who, quest, summary, milestones, path: cliff,
  gate, grownup
};

const ONBOARDING = ['handoff', 'meet', 'sees', 'subjects', 'interests', 'checkin'];
const GROWNUP_ONLY = ['grownup'];

export function guard(app, r) {
  const st = app.store.state;
  const name = r.name;
  if (app.store.readOnly) return name === 'blocked' ? null : 'blocked';
  if (!app.bankOk) return name === 'no-texts' ? null : 'no-texts';
  if (!st.consent) return name === 'welcome' ? null : 'welcome';
  if (name === 'welcome') return st.learners.length ? 'today' : 'add';
  if (!st.learners.length) return name === 'add' ? null : 'add';
  if (name === 'add') return null;
  // A running quest keeps the screen: the Back button can never reopen a locked answer.
  if (app.run) return name === 'quest' ? null : 'quest';
  if (name === 'quest') return 'today';
  if (name === 'summary' && !app.lastQuest) return 'today';
  if (GROWNUP_ONLY.includes(name)) return app.grownupOpen ? null : 'gate';
  if (name === 'gate') return null;
  if (app.grownupOpen && name !== 'grownup') app.grownupOpen = false; // leaving the area closes it
  const l = app.learner();
  if (!l) return 'add';
  if (name === 'who') return null;
  // Before the check-in, only the onboarding screens. After it, never the onboarding screens again.
  if (!hasCheckin(l)) return ONBOARDING.includes(name) ? null : 'handoff';
  if (name === 'interests' || name === 'subjects') return 'my-interests';
  // A subject added later gets its check-in from here or from Today.
  if (name === 'checkin') return nextCheckin(l) ? null : 'today';
  if (ONBOARDING.includes(name) || !routes[name]) return 'today';
  return null;
}
