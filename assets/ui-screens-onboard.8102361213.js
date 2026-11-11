// T1 to T3 for the grown-up, then C1, C2, subjects, C3 interests, the check-in intro and C5 for the child.
import { h, icon } from './ui-dom.43bde315e2.js';
import { screen, eyebrow, button, character, topbar } from './ui-common.4acae333f8.js';
import { T1, T2, T3, C1, C2, C3, CHECKIN, C5, SKILL_KID, SUBJECTS_COPY } from './text-copy.5e71bb1047.js';
import { noticeBlocks, NOTICE_TITLE, CONSENT_LABEL, noticeVersion, storageLine } from './text-notice.e16e9261e4.js';
import { MAX_LEARNERS, INTEREST_MAX } from './engine-constants.f6f2fc2188.js';
import { checkNick, checkGrade, nickTaken } from './engine-nick.095b899fd9.js';
import { newLearner } from './state-model.76e8252557.js';
import { bandForGrade, bandList, toggle, pickStatus, setInterests, canAdd } from './engine-interests.7dd0456ab8.js';
import { focusSkill } from './text-report-text.b1d09bb2dc.js';
import { SUBJECT_IDS, subjectFor, nextCheckin, learnerSubjects } from './engine-subjects.b9c5ff3bf4.js';
import { activeSubject } from './engine-select.dcc6fcf48a.js';
import { stage, clip, hasClip, motionOn } from './ui-stage.b19732b10d.js';
import { award } from './engine-milestones.1beec5fbec.js';
import { rewardsCard } from './ui-rewards.554b0d3302.js';

export function noticeView(app, headingLevel = 'h2') {
  return h('div', { class: 'notice' },
    h(headingLevel, { text: NOTICE_TITLE }),
    noticeBlocks(app.data.SITE).map(b => h('p', {}, b.h ? h('strong', { text: b.h + ' ' }) : null, b.p)),
    h('p', { text: storageLine(app.data.SITE) }));
}

export function welcome(app) {
  const box = h('input', { type: 'checkbox', id: 'consent' }); // unchecked by default, never pre-ticked
  const err = h('p', { class: 'error', id: 'consent-error', role: 'alert' });
  box.addEventListener('change', () => { if (box.checked) err.textContent = ''; });
  const go = () => {
    if (!box.checked) { err.textContent = T1.blocked; box.focus(); return; }
    app.save({ ...app.store.state, consent: { at: app.clock.nowIso(), noticeVersion: noticeVersion(app.data.SITE) } });
    app.go('add');
  };
  return screen('parent',
    eyebrow(T1.eyebrow),
    h('h1', { text: T1.title }),
    h('p', { class: 'lead', text: app.data.SITE.app ? T1.leadApp : T1.lead }),
    h('div', { class: 'card' }, noticeView(app)),
    h('div', { class: 'consent' }, box, h('label', { for: 'consent', text: CONSENT_LABEL })),
    err,
    button(T1.continue, go, 'primary block'));
}

export function addLearner(app, arg) {
  const fromGrownup = arg === 'more';
  const state = app.store.state;
  if (state.learners.length >= MAX_LEARNERS) {
    return screen('parent', h('h1', { text: T2.title }), h('p', { text: T2.full }), button('Back', () => app.go(fromGrownup ? 'grownup/learners' : 'today'), 'secondary'));
  }
  const nick = h('input', { id: 'nick', type: 'text', maxlength: 20, autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', 'aria-describedby': 'nick-hint nick-error', required: true });
  const nickErr = h('p', { class: 'error', id: 'nick-error', role: 'alert' });
  const grade = h('select', { id: 'grade', required: true, 'aria-describedby': 'grade-error' },
    h('option', { value: '', text: 'Choose a grade' }),
    Array.from({ length: 12 }, (_, i) => h('option', { value: String(i + 1), text: T2.gradeOption(i + 1) })));
  const gradeErr = h('p', { class: 'error', id: 'grade-error', role: 'alert' });
  const submit = e => {
    e.preventDefault();
    let n = checkNick(nick.value);
    if (n.ok && nickTaken(n.nick, app.store.state.learners)) n = { ok: false, reason: 'taken' };
    const g = checkGrade(grade.value);
    nickErr.textContent = n.ok ? '' : (n.reason === 'long' ? T2.nickLong : n.reason === 'taken' ? T2.nickTaken : T2.nickError);
    gradeErr.textContent = g.ok ? '' : T2.gradeError;
    nick.setAttribute('aria-invalid', n.ok ? 'false' : 'true');
    if (!n.ok) { nick.focus(); return; }
    if (!g.ok) { grade.focus(); return; }
    const l = newLearner(globalThis.crypto.randomUUID(), n.nick, g.grade);
    const s = app.store.state;
    app.save({ ...s, learners: [...s.learners, l], activeLearnerId: l.id });
    nick.value = '';
    app.go(fromGrownup ? 'grownup/learners' : 'handoff');
  };
  return screen('parent',
    eyebrow(T2.eyebrow),
    h('h1', { text: T2.title }),
    h('form', { class: 'form', novalidate: true, onsubmit: submit },
      h('label', { for: 'nick', text: T2.nickLabel }),
      h('p', { class: 'hint', id: 'nick-hint', text: T2.nickHint }),
      nick, nickErr,
      h('label', { for: 'grade', text: T2.gradeLabel }),
      grade, gradeErr,
      h('p', { class: 'hint', text: T2.note }),
      h('button', { class: 'btn primary block', type: 'submit' }, T2.submit)));
}

export function handoff(app) {
  return screen('parent',
    eyebrow(T3.eyebrow),
    h('h1', { text: T3.title }),
    T3.body.map(t => h('p', { text: t })),
    button(T3.button, () => { app.grownupOpen = false; app.go('meet'); }, 'primary block'));
}

export function meet(app) {
  const l = app.learner();
  const band = bandForGrade(l.grade);
  return screen('child',
    h('div', { class: 'skip-row' }, button(C1.skip, () => app.go('sees'), 'text')),
    stage(app, 'pip'),
    h('h1', { text: C1.title(l.nick) }),
    C1.body[band].map(t => h('p', { class: 'lead', text: t })),
    button(C1.next, () => app.go('sees'), 'primary block'));
}

export function sees(app) {
  const l = app.learner();
  return screen('child',
    h('div', { class: 'skip-row' }, button(C2.skip, () => app.go('subjects'), 'text')),
    h('h1', { text: C2.title }),
    h('p', { class: 'lead', text: C2.lead }),
    h('ul', { class: 'list' }, C2.items.map(t => h('li', { text: t }))),
    h('p', { text: C2.after }),
    h('div', { class: 'hero small' }, character('pip', 'idle', l.grade, { decorative: true })),
    button(C2.next, () => app.go('subjects'), 'primary block'));
}

// The subject picker: one or more of Reading, Math, Science, Social studies. Nothing is picked for the child.
export function subjectEditor(app, learner, { mode, onDone }) {
  const offered = SUBJECT_IDS.filter(id => (app.data.SUBJECTS_AVAILABLE || SUBJECT_IDS).includes(id));
  let picked = (learner.subjects || []).filter(id => offered.includes(id));
  const msg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
  const counter = h('p', { class: 'counter' });
  const tiles = h('div', { class: 'tiles subjects', role: 'group', 'aria-label': SUBJECTS_COPY.eyebrow });
  const paint = () => {
    counter.textContent = SUBJECTS_COPY.counter(picked.length);
    for (const b of tiles.children) b.setAttribute('aria-pressed', picked.includes(b.dataset.id) ? 'true' : 'false');
  };
  for (const id of offered) {
    const S = subjectFor(id);
    tiles.append(h('button', {
      class: 'tile subject-tile', type: 'button', dataset: { id }, 'aria-pressed': 'false',
      onclick: e => {
        const on = !picked.includes(id);
        picked = on ? [...picked, id] : picked.filter(x => x !== id);
        msg.textContent = on ? SUBJECTS_COPY.picked(S.label, S.guideName) : '';
        paint();
        // When a subject is picked, its guide cheers once in the tile (a still drawing if movement is off).
        const slot = e.currentTarget.querySelector('.tile-guide-slot');
        if (on && slot && hasClip(app, `${S.guide}-cheer`) && motionOn(app)) {
          const v = clip(app, `${S.guide}-cheer`, 'tile-clip');
          slot.replaceChildren(v);
          v.addEventListener('ended', () => slot.replaceChildren(character(S.guide, 'cheer', learner.grade, { decorative: true, cls: 'tile-guide' })));
        } else if (slot) slot.replaceChildren(character(S.guide, on ? 'cheer' : 'idle', learner.grade, { decorative: true, cls: 'tile-guide' }));
      }
    }, h('span', { class: 'tile-guide-slot' }, character(S.guide, (learner.subjects || []).includes(id) ? 'cheer' : 'idle', learner.grade, { decorative: true, cls: 'tile-guide' })),
      h('span', { class: 'tile-text' }, h('span', { class: 'tile-title', text: S.label }), h('span', { class: 'tile-blurb', text: SUBJECTS_COPY.blurb[id] }))));
  }
  const save = () => {
    if (!picked.length) { msg.textContent = SUBJECTS_COPY.few; return; }
    app.store.updateLearner(learner.id, l => award({ ...l, subjects: [...picked], subject: picked.includes(l.subject) ? l.subject : picked[0] }, app.clock.nowIso()).learner);
    onDone();
  };
  paint();
  return h('div', { class: 'subject-editor' }, counter, tiles, msg,
    button(mode === 'onboard' ? SUBJECTS_COPY.continue : SUBJECTS_COPY.save, save, 'primary block'));
}

export function subjects(app) {
  const l = app.learner();
  return screen('child',
    topbar('Getting started', { onBack: () => app.go('sees'), progress: 0.33 }),
    eyebrow(SUBJECTS_COPY.eyebrow),
    h('h1', { text: SUBJECTS_COPY.title }),
    h('p', { class: 'lead', text: SUBJECTS_COPY.lead }),
    subjectEditor(app, l, { mode: 'onboard', onDone: () => app.go('interests') }));
}

// The interest picker, used in onboarding, by the child from Today, and in the Grown-up area.
export function interestEditor(app, learner, { mode, onDone }) {
  let picked = learner.surprise ? [] : [...learner.interests];
  let surprise = learner.surprise;
  const list = bandList(app.data.INTERESTS, learner.grade);
  const msg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
  const counter = h('p', { class: 'counter' });
  const tiles = h('div', { class: 'tiles', role: 'group', 'aria-label': 'Interests' });
  const surpriseBtn = h('button', { class: 'tile surprise', type: 'button', 'aria-pressed': 'false' }, icon('sparkle', 'icon tile-icon'), h('span', { text: C3.surprise }));

  const paint = () => {
    counter.textContent = surprise ? C3.surpriseOn : C3.counter(picked.length);
    surpriseBtn.setAttribute('aria-pressed', surprise ? 'true' : 'false');
    for (const b of tiles.children) {
      const on = picked.includes(b.dataset.id);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  };
  surpriseBtn.addEventListener('click', () => { surprise = !surprise; if (surprise) picked = []; msg.textContent = ''; paint(); });
  for (const it of list) {
    tiles.append(h('button', {
      class: 'tile', type: 'button', dataset: { id: it.id }, 'aria-pressed': 'false',
      onclick: () => {
        if (!picked.includes(it.id) && !canAdd(picked)) { msg.textContent = C3.many; return; }
        picked = toggle(picked, it.id);
        surprise = false;
        msg.textContent = '';
        paint();
      }
    }, h('span', { class: 'tile-badge', 'aria-hidden': 'true', text: it.label.charAt(0) }), h('span', { text: it.label })));
  }
  const save = () => {
    if (!surprise && !pickStatus(picked).ok) { msg.textContent = picked.length > INTEREST_MAX ? C3.many : C3.few; return; }
    commit(surprise ? [] : picked, surprise);
  };
  const commit = (ids, isSurprise) => {
    app.store.updateLearner(learner.id, l => setInterests(l, ids, isSurprise, app.clock.nowIso()));
    onDone();
  };
  paint();
  return h('div', { class: 'interest-editor' },
    counter, surpriseBtn, tiles, msg,
    button(mode === 'onboard' ? C3.continue : C3.save, save, 'primary block'),
    mode === 'onboard' ? button(C3.skip, () => commit([], true), 'text') : null);
}

export function interests(app) {
  const l = app.learner();
  return screen('child',
    topbar('Getting started', { onBack: () => app.go('subjects'), progress: 0.66 }),
    eyebrow(C3.eyebrow),
    h('h1', { text: C3.title }),
    h('p', { class: 'lead', text: C3.lead }),
    interestEditor(app, l, { mode: 'onboard', onDone: () => app.go('checkin') }));
}

export function checkinIntro(app, startQuest) {
  const l = app.learner();
  const subject = nextCheckin(l) || activeSubject(l);
  const S = subjectFor(subject);
  return screen('child',
    eyebrow(CHECKIN.eyebrow),
    h('h1', { text: CHECKIN.title(S.label) }),
    h('div', { class: 'hero small' }, character(S.guide, 'think', l.grade, { decorative: true })),
    h('p', { class: 'lead', text: CHECKIN.body }),
    button(CHECKIN.start, () => startQuest(app, 'checkin', subject), 'primary block'));
}

export function startingPoint(app) {
  const l = app.learner();
  const q = (app.lastQuest && app.lastQuest.kind === 'checkin') ? app.lastQuest : [...l.quests].reverse().find(x => x.kind === 'checkin');
  if (!q) return screen('child', h('h1', { text: C5.eyebrow }), button(C5.next, () => app.go('today'), 'primary block'));
  const S = subjectFor(q.subject);
  const skill = focusSkill(q.rows, q.subject);
  const next = nextCheckin(l);
  return screen('child',
    eyebrow(C5.eyebrow),
    stage(app, 'lumi', { mood: 'cheer' }),
    h('h1', { text: C5.title(q.levelEnd, S.label) }),
    h('p', { class: 'lead', text: C5.right(q.right, q.of) }),
    skill ? [h('p', { text: C5.work }), h('p', { class: 'skill-tip' }, h('strong', { text: SKILL_KID[skill].name + '. ' }), SKILL_KID[skill].tip)] : h('p', { text: C5.allStrong }),
    app.lastQuest ? rewardsCard(app, { stop: false }) : null,
    next ? button(C5.nextCheckin(subjectFor(next).label), () => { app.lastQuest = null; app.go('checkin'); }, 'primary block') : null,
    button(C5.next, () => { app.lastQuest = null; app.go('today'); }, next ? 'secondary block' : 'primary block'));
}

