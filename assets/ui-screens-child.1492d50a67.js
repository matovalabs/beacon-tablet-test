// C6 Today, My interests and subjects, Switch reader, and the quest run (section 7).
import { h, s, icon, clear } from './ui-dom.43bde315e2.js';
import { passageBody, wordCard, openWordHelp, stopVoice } from './ui-word-help.847b05b719.js';
import { stage, celebrate } from './ui-stage.7026a28f6d.js';
import { award } from './engine-milestones.1beec5fbec.js';
import { countReadingDay, keepsakeFor, newlyUnlocked } from './engine-retention.44d90a9335.js';
import { weekCard, rewardsCard } from './ui-rewards.c58763a904.js';
import { screen, eyebrow, button, character, topbar, progressBar, confirmDialog, interestLabel, topicLabel, hasCheckin } from './ui-common.4acae333f8.js';
import { openLayer, closeLayer } from './ui-layer.bb980036ff.js';
import { interestEditor, subjectEditor } from './ui-screens-onboard.1d2febe22e.js';
import { TODAY, READ, DUMP, QUESTION, FEEDBACK, SUMMARY, SKILL_KID, SKILL_EYEBROW, C3, BANNERS, SUBJECTS_COPY, MILESTONES, CELEBRATE } from './text-copy.5e71bb1047.js';
import { chooseNext, applyFinishedQuest, levelOf, activeSubject, nextQuestNumber } from './engine-select.dcc6fcf48a.js';
import { QuestRun } from './engine-quest.4e9b7021a4.js';
import { moreLikeThis, lessLikeThis, bandForGrade } from './engine-interests.7dd0456ab8.js';
import { outcome } from './engine-levels.3311cee783.js';
import { focusSkill } from './text-report-text.b1d09bb2dc.js';
import { subjectFor, learnerSubjects, hasCheckinFor } from './engine-subjects.b9c5ff3bf4.js';
import { DUMP_MAX_CHARS, QUEST_QUESTIONS, LEVEL_MAX } from './engine-constants.f6f2fc2188.js';

const LETTERS = ['A', 'B', 'C', 'D'];

function nextChoice(app, learner, subject = activeSubject(learner)) {
  return chooseNext(learner, nextQuestNumber(learner), app.data.BANK, app.data.TOPIC_MAP, subject);
}

function choiceLabel(app, choice) {
  if (!choice || choice.mixed) return null;
  return interestLabel(app, choice.interestId) || topicLabel(app, choice.topic);
}

export function startQuest(app, kind, subject) {
  const learner = app.learner();
  const sub = subject || activeSubject(learner);
  const choice = nextChoice(app, learner, sub);
  if (!choice || !app.bankOk) { app.flash = BANNERS.noBank; app.render(); return; }
  if (learner.subject !== sub) app.updateLearner(l => ({ ...l, subject: sub }));
  app.lastQuest = null;
  app.summaryTap = null;
  app.run = new QuestRun({ learner: app.learner(), choice, kind, telemetry: app.tel, clock: app.clock });
  app.claimTab();
  app.go('quest');
}

function ring(level) {
  const r = 26, c = 2 * Math.PI * r;
  const done = (level / LEVEL_MAX) * c;
  return h('div', { class: 'ring' },
    s('svg', { viewBox: '0 0 64 64', width: 64, height: 64, 'aria-hidden': 'true', focusable: 'false' },
      s('circle', { cx: 32, cy: 32, r, class: 'ring-track', fill: 'none', 'stroke-width': 6 }),
      s('circle', { cx: 32, cy: 32, r, class: 'ring-fill', fill: 'none', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': `${done.toFixed(1)} ${c.toFixed(1)}`, transform: 'rotate(-90 32 32)' })),
    h('span', { class: 'ring-label', text: TODAY.level(level) }));
}

// Tabs for the picked subjects. Switching saves the active subject.
function subjectTabs(app, l, current) {
  const list = learnerSubjects(l);
  if (list.length < 2) return null;
  return h('div', { class: 'subject-tabs', role: 'group', 'aria-label': TODAY.subjectsLabel },
    list.map(id => h('button', {
      class: 'subject-tab', type: 'button', 'aria-pressed': id === current ? 'true' : 'false',
      onclick: () => { app.updateLearner(x => ({ ...x, subject: id })); app.render(); }
    }, character(subjectFor(id).guide, 'idle', l.grade, { decorative: true, cls: 'tab-guide' }), subjectFor(id).label)));
}

export function today(app) {
  const l = app.learner();
  const subject = activeSubject(l);
  const S = subjectFor(subject);
  const needsCheckin = !hasCheckinFor(l, subject);
  const choice = needsCheckin ? null : nextChoice(app, l, subject);
  const label = choiceLabel(app, choice);
  const chips = l.surprise || !l.interests.length
    ? [h('li', { class: 'chip', text: TODAY.surprise })]
    : l.interests.map(id => h('li', { class: 'chip', text: interestLabel(app, id) || id }));
  let card;
  if (needsCheckin) {
    card = h('div', { class: 'card quest-card' },
      eyebrow(S.label),
      h('h2', { class: 'quest-title', text: TODAY.checkinFirst(S.label) }),
      h('p', { class: 'muted', text: TODAY.meta }),
      button(TODAY.checkinStart, () => app.go('checkin'), 'primary block', { 'data-autofocus': true }));
  } else if (choice) {
    card = h('div', { class: 'card quest-card' },
      eyebrow(`${TODAY.eyebrow}: ${S.label}`),
      h('h2', { class: 'quest-title', text: choice.passage.title }),
      h('p', { class: 'muted', text: TODAY.meta }),
      h('p', { class: 'chip-line', text: label ? TODAY.picked(label) : TODAY.mix }),
      choice.repeat ? h('p', { class: 'note', text: TODAY.repeat }) : null,
      button(TODAY.start, () => startQuest(app, 'quest', subject), 'primary block', { 'data-autofocus': true }));
  } else {
    card = h('p', { class: 'note', text: TODAY.noTexts(S.label) });
  }
  return screen('child',
    h('header', { class: 'today-head' },
      h('p', { class: 'brand' }, h('img', { class: 'brand-mark', src: `assets/art/${bandForGrade(l.grade)}/lumi-idle.svg`, alt: '', width: 28, height: 34 }), 'Beacon'),
      button(TODAY.myInterests, () => app.go('my-interests'), 'pill')),
    h('h1', { class: 'today-hello', text: TODAY.hello(l.nick) }),
    subjectTabs(app, l, subject),
    stage(app, S.guide, { cls: 'today-stage' }),
    card,
    weekCard(app),
    h('div', { class: 'row-between' },
      h('h2', { class: 'eyebrow', text: TODAY.interestsTitle }),
      button(TODAY.change, () => app.go('my-interests'), 'text')),
    h('ul', { class: 'chips' }, chips),
    h('div', { class: 'today-foot' },
      ring(levelOf(l, subject)),
      h('p', { class: 'muted', text: TODAY.done(l.quests.filter(q => (q.subject || 'reading') === subject && q.kind !== 'checkin').length) })),
    h('div', { class: 'row-2' },
      button(`${MILESTONES.open} (${(l.milestones || []).length})`, () => app.go('milestones'), 'secondary'),
      app.store.state.learners.length > 1 ? button(TODAY.switchReader, () => app.go('who'), 'secondary') : null,
      button(TODAY.grownups, () => app.go('gate'), 'secondary')));
}

export function milestones(app) {
  const l = app.learner();
  const list = [...(l.milestones || [])].reverse();
  return screen('child',
    topbar(MILESTONES.title, { onBack: () => app.go('today') }),
    h('h1', { text: MILESTONES.title }),
    stage(app, 'lumi', { walk: false, cls: 'small-stage' }),
    list.length ? h('ul', { class: 'milestones' }, list.map(m => h('li', {}, icon('sparkle'), h('span', { text: MILESTONES.label(m.id, id => subjectFor(id).label) })))) : h('p', { class: 'lead', text: MILESTONES.none }));
}

export function myInterests(app) {
  const l = app.learner();
  return screen('child',
    topbar(C3.eyebrow, { onBack: () => app.go('today') }),
    h('h1', { text: C3.title }),
    h('p', { class: 'lead', text: C3.lead }),
    interestEditor(app, l, { mode: 'child', onDone: () => { app.flash = C3.saved; app.go('today'); } }),
    h('h2', { text: SUBJECTS_COPY.title }),
    h('p', { class: 'muted', text: SUBJECTS_COPY.lead }),
    subjectEditor(app, l, { mode: 'child', onDone: () => { app.flash = SUBJECTS_COPY.saved; app.go('today'); } }));
}

export function who(app) {
  const st = app.store.state;
  return screen('child',
    topbar('Readers', { onBack: () => app.go('today') }),
    h('h1', { text: 'Who is reading?' }),
    h('div', { class: 'stack' }, st.learners.map(l => button(l.nick, () => {
      app.save({ ...app.store.state, activeLearnerId: l.id });
      app.go(hasCheckin(l) ? 'today' : 'meet');
    }, 'secondary block'))));
}

// The guide for the subject on screen: Pip, Tally, Fizz or Atlas.
function guideOf(app) {
  return subjectFor(app.run ? app.run.subject : activeSubject(app.learner())).guide;
}

function openLookBack(app, passage) {
  app.run.telemetry.lookBack();
  const slot = h('div', { class: 'helper-slot', 'aria-live': 'polite' });
  const d = h('dialog', { class: 'sheet tall', 'aria-labelledby': 'lb-title' },
    h('h2', { id: 'lb-title', text: passage.title }),
    passageBody(app, passage, e => {
      clear(slot);
      slot.append(wordCard(app, passage, e, () => clear(slot), { guide: guideOf(app) }));
      slot.scrollIntoView({ block: 'nearest' });
    }),
    slot,
    button(QUESTION.close, () => { stopVoice(); closeLayer(); }, 'primary block', { 'data-autofocus': true }));
  d.addEventListener('close', () => { stopVoice(); closeLayer(); });
  openLayer(d);
}

async function stopQuest(app) {
  const yes = await confirmDialog(READ.stop, READ.stopConfirm, READ.stopYes, READ.stopNo);
  if (!yes) return;
  app.dropQuest();
  app.go('today');
}

export function quest(app) {
  const run = app.run;
  const l = app.learner();
  const stopBtn = () => h('button', { class: 'btn icon-btn', type: 'button', 'aria-label': READ.stop, onclick: () => stopQuest(app) }, icon('back'));
  const top = (label, frac) => h('div', { class: 'topbar' }, stopBtn(), h('div', { class: 'topbar-main' }, h('p', { class: 'topbar-label', text: label }), progressBar(frac, label)));

  if (run.phase === 'reading') {
    return screen('child',
      top(READ.progress, 0),
      h('h1', { text: run.passage.title }),
      passageBody(app, run.passage, e => openWordHelp(app, run.passage, e, { guide: guideOf(app) })),
      h('p', { class: 'muted small', text: READ.hint }),
      button(READ.ready, () => { run.ready(); app.render(); }, 'primary block'));
  }

  if (run.phase === 'dump') {
    const ta = h('textarea', { id: 'dump', maxlength: DUMP_MAX_CHARS, rows: 3, autocomplete: 'off', autocorrect: 'off', autocapitalize: 'sentences', spellcheck: 'false', 'aria-describedby': 'dump-hint' });
    let before = null;
    ta.addEventListener('beforeinput', () => { before = { len: ta.value.length, sel: Math.max(0, ta.selectionEnd - ta.selectionStart) }; });
    ta.addEventListener('input', e => {
      // Paste length from the input event only. The clipboard is never read.
      if ((e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') && before) app.tel.paste(Math.max(0, ta.value.length - before.len + before.sel));
      before = null;
    });
    const leave = fn => { const n = ta.value.length; ta.value = ''; fn(n); app.render(); };
    return screen('child',
      top(READ.progress, 0),
      h('div', { class: 'hero small' }, character(subjectFor(run.subject).guide, 'idle', l.grade, { decorative: true })),
      h('h1', { text: DUMP.title(subjectFor(run.subject).guideName) }),
      h('label', { for: 'dump', class: 'sr-only', text: DUMP.label }),
      ta,
      h('p', { class: 'muted small', id: 'dump-hint', text: DUMP.hint }),
      h('div', { class: 'row-2 equal' },
        button(DUMP.skip, () => leave(() => run.dumpSkip()), 'secondary', { id: 'dump-skip' }),
        button(DUMP.done, () => leave(n => run.dumpDone(n)), 'primary', { id: 'dump-done' })));
  }

  if (run.phase === 'question' || run.phase === 'feedback') return questionScreen(app, run, l, top);
  return h('div');
}

function questionScreen(app, run, l, top) {
  const q = run.question;
  const i = run.qi + 1;
  const locked = run.phase === 'feedback';
  const picked = locked ? run.picked[run.qi] : null;
  const label = QUESTION.progress(i, QUEST_QUESTIONS);
  const msg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
  const radios = [];
  const choices = h('fieldset', { class: 'choices', 'data-region': 'choice' },
    h('legend', { class: 'sr-only', text: QUESTION.choicesLabel }),
    q.c.map((text, k) => {
      const input = h('input', { type: 'radio', name: 'choice', value: String(k), id: `c${k}`, disabled: locked, checked: locked && picked === k, onchange: () => { msg.textContent = ''; } });
      radios.push(input);
      let cls = 'choice';
      let tag = null;
      if (locked && k === q.a) { cls += ' is-right'; tag = h('span', { class: 'tag' }, icon('check'), FEEDBACK.correctTag); }
      else if (locked && k === picked) { cls += ' is-wrong'; tag = h('span', { class: 'tag' }, icon('cross'), FEEDBACK.yourAnswer); }
      else if (locked) cls += ' is-dim';
      return h('label', { class: cls, for: `c${k}` }, input,
        h('span', { class: 'letter', 'aria-hidden': 'true', text: LETTERS[k] }),
        h('span', { class: 'ctext' }, h('span', { class: 'sr-only', text: `${LETTERS[k]}. ` }), text, tag));
    }));

  const kids = [
    top(label, (locked ? i : i - 1) / QUEST_QUESTIONS),
    eyebrow(SKILL_EYEBROW[q.skill]),
    h('h1', { class: 'question', 'data-region': 'question', text: q.q }),
    h('div', { class: 'row-tools' }, h('button', { class: 'btn pill', type: 'button', onclick: () => openLookBack(app, run.passage) }, icon('book'), QUESTION.lookBack)),
    choices,
    msg
  ];

  if (!locked) {
    kids.push(button(QUESTION.check, () => {
      const sel = radios.findIndex(r => r.checked);
      if (sel < 0) { msg.textContent = QUESTION.choose; radios[0].focus(); return; }
      run.check(sel);
      app.render();
    }, 'primary block sticky'));
  } else {
    const ok = picked === q.a;
    const band = bandForGrade(l.grade);
    kids.push(h('div', { class: `feedback ${ok ? 'good' : 'tricky'}`, 'data-reveal': true },
      character(subjectFor(run.subject).guide, ok ? 'cheer' : 'oops', l.grade, { decorative: true, cls: 'fb-pip' }),
      h('div', { class: 'fb-text' },
        h('h2', { tabindex: '-1', 'data-autofocus': true }, icon(ok ? 'check' : 'cross', 'icon fb-icon'), ok ? FEEDBACK.rightTitle[band] : FEEDBACK.wrongTitle[band]),
        ok ? null : h('p', {}, h('strong', { text: FEEDBACK.rightAnswer(LETTERS[q.a]) + ' ' }), q.c[q.a]),
        h('p', { text: q.why })),
      button(run.qi + 1 < QUEST_QUESTIONS ? FEEDBACK.next : FEEDBACK.finish, () => {
        run.next();
        if (run.phase === 'summary') finishQuest(app);
        else app.render();
      }, 'primary block')));
  }
  return screen('child', ...kids);
}

function finishQuest(app) {
  const run = app.run;
  const words = run.wordsExplored || 0;
  const questRecord = run.finish();
  let fresh = [];
  let rewards = { keepsake: null, unlocked: [] };
  app.store.updateLearner(run.learnerId, l => {
    const day = countReadingDay(applyFinishedQuest(l, questRecord), questRecord.at);
    const r = award({ ...day.learner, wordsExplored: (l.wordsExplored || 0) + words }, app.clock.nowIso());
    fresh = r.fresh;
    rewards = { keepsake: day.newDay ? keepsakeFor(r.learner.readingDays) : null, unlocked: newlyUnlocked(l, r.learner) };
    return r.learner;
  });
  app.lastRewards = rewards;
  const S = subjectFor(questRecord.subject);
  const lines = fresh.map(id => MILESTONES.label(id, x => subjectFor(x).label));
  if (questRecord.kind === 'quest' && questRecord.levelEnd > questRecord.levelStart) {
    app.pendingCelebration = { clipId: 'lumi-levelup', guide: 'lumi', title: CELEBRATE.levelUpTitle(S.label), lines: [CELEBRATE.levelUpBody(questRecord.levelEnd), ...lines] };
  } else if (fresh.length) {
    app.pendingCelebration = { clipId: `${S.guide}-cheer`, guide: S.guide, title: CELEBRATE.milestoneTitle, lines };
  }
  app.lastQuest = questRecord;
  app.run = null;
  app.summaryTap = null;
  app.go(questRecord.kind === 'checkin' ? 'start' : 'summary');
}

export function summary(app) {
  const l = app.learner();
  const qr = app.lastQuest;
  const moved = outcome(qr.levelStart, qr.right, qr.of);
  // At the top or bottom level the level cannot move, so the line must not promise a change.
  const o = qr.levelEnd !== qr.levelStart ? moved : moved === 'up' ? 'cap' : moved === 'down' ? 'floor' : 'hold';
  const skill = focusSkill(qr.rows, qr.subject);
  const label = (qr.interestId && interestLabel(app, qr.interestId)) || topicLabel(app, qr.topic);
  const tapMsg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite', text: app.summaryTap === 'more' ? SUMMARY.moreDone : app.summaryTap === 'less' ? SUMMARY.lessDone : '' });
  const tap = kind => {
    if (app.summaryTap) return; // one tap per quest
    app.summaryTap = kind;
    app.updateLearner(x => (kind === 'more' ? moreLikeThis(x, qr.topic) : lessLikeThis(x, qr.topic, qr.n)));
    app.render();
  };
  return screen('child',
    eyebrow(SUMMARY.eyebrow),
    stage(app, 'lumi', { mood: 'cheer', cls: 'summary-stage' }),
    h('h1', { text: SUMMARY.title }),
    h('p', { class: 'lead big', text: SUMMARY.score(qr.right, qr.of) }),
    h('p', { text: SUMMARY[o] }),
    skill ? h('div', { class: 'card' }, h('p', { text: SUMMARY.work }), h('p', { class: 'skill-tip' }, h('strong', { text: SKILL_KID[skill].name + '. ' }), SKILL_KID[skill].tip)) : h('p', { text: SUMMARY.allStrong }),
    h('div', { class: 'card' },
      h('h2', { class: 'small-h', text: SUMMARY.aboutTopic(label) }),
      app.summaryTap ? null : h('div', { class: 'row-2 equal' },
        button(SUMMARY.less, () => tap('less'), 'secondary'),
        button(SUMMARY.more, () => tap('more'), 'secondary')),
      tapMsg),
    rewardsCard(app),
    button(SUMMARY.done, () => { app.lastQuest = null; app.go('today'); }, 'primary block'));
}
