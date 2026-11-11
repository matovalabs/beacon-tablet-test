// The Grown-up area: gate, Reports, Progress, Interests, Settings and privacy, Readers (section 12).
import { h, s, icon } from './ui-dom.43bde315e2.js';
import { screen, eyebrow, button, confirmDialog, formatDate, interestLabel, topicLabel, passageTitle, hasCheckin } from './ui-common.4acae333f8.js';
import { interestEditor, subjectEditor, noticeView } from './ui-screens-onboard.1d2febe22e.js';
import { GATE, GROWNUP, T2, C3 } from './text-copy.5e71bb1047.js';
import { buildReport, skillTotals, SKILL_NAMES, skillsFor, PROGRESS_HONEST, CLIPBOARD_LINE } from './text-report-text.b1d09bb2dc.js';
import { subjectFor, learnerSubjects } from './engine-subjects.b9c5ff3bf4.js';
import { levelOf } from './engine-select.dcc6fcf48a.js';
import { SUBJECTS_COPY, SETTINGS_MEDIA } from './text-copy.5e71bb1047.js';
import { exportSummary } from './state-summary.5fd4a894e6.js';
import { checkNick, checkGrade, nickTaken } from './engine-nick.095b899fd9.js';
import { changeGrade } from './engine-interests.7dd0456ab8.js';
import { MAX_LEARNERS, LEVEL_MAX } from './engine-constants.f6f2fc2188.js';
import { reminderSettings, syncReminder } from './ui-reminder.a8894c8223.js';

// The gate: a new multiplication each time. It stops a young child by accident; it is not security.
function newSum() {
  // 12 to 19 times 3 to 9: quick for a grown-up, past the times tables a 9 year old knows by heart.
  const a = 12 + Math.floor(Math.random() * 8);
  const b = 3 + Math.floor(Math.random() * 7);
  return { a, b };
}

export function gate(app) {
  let sum = newSum();
  let entry = '';
  const qEl = h('p', { class: 'gate-q', id: 'gate-q', text: GATE.question(sum.a, sum.b) });
  const shown = h('output', { class: 'gate-entry', 'aria-live': 'polite', 'aria-label': 'Your answer', for: 'gate-q' });
  const msg = h('p', { class: 'msg', role: 'alert' });
  const paint = () => { shown.textContent = entry || ' '; };
  const press = d => { if (entry.length < 3) { entry += d; paint(); } };
  const submit = () => {
    if (Number(entry) === sum.a * sum.b && entry !== '') {
      app.grownupOpen = true;
      app.go('grownup/reports');
      return;
    }
    sum = newSum(); entry = '';
    qEl.textContent = GATE.question(sum.a, sum.b);
    msg.textContent = GATE.wrong;
    paint();
  };
  paint();
  const pad = h('div', { class: 'numpad' },
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => button(String(d), () => press(String(d)), 'key')),
    h('button', { class: 'btn key', type: 'button', 'aria-label': GATE.clear, onclick: () => { entry = entry.slice(0, -1); paint(); } }, icon('back')),
    button('0', () => press('0'), 'key'),
    button(GATE.ok, submit, 'key primary'));
  const view = screen('parent',
    h('h1', { text: GATE.title }),
    h('p', { text: GATE.lead }),
    qEl, shown, msg, pad,
    h('p', { class: 'muted small', text: GATE.note }),
    button(GATE.cancel, () => app.go('today'), 'text'));
  // A keyboard works too: digits, Backspace and Enter.
  view.addEventListener('keydown', e => {
    if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { entry = entry.slice(0, -1); paint(); e.preventDefault(); }
    else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { submit(); e.preventDefault(); }
  });
  return view;
}

function shell(app, tab, ...kids) {
  const st = app.store.state;
  const l = app.learner();
  const sel = h('select', { id: 'reader', onchange: e => { app.save({ ...app.store.state, activeLearnerId: e.target.value }); app.render(); } },
    st.learners.map(x => h('option', { value: x.id, selected: x.id === st.activeLearnerId, text: x.nick })));
  const tabs = Object.entries(GROWNUP.tabs).map(([k, label]) =>
    h('a', { class: `tab${k === tab ? ' on' : ''}`, href: `#/grownup/${k}`, 'aria-current': k === tab ? 'page' : null, text: label }));
  return screen('parent',
    h('div', { class: 'gu-head' },
      h('div', {}, eyebrow(GROWNUP.title), h('label', { for: 'reader', class: 'small-label', text: GROWNUP.reader }), sel),
      button(GROWNUP.handOver, () => { app.grownupOpen = false; app.go(hasCheckin(app.learner()) ? 'today' : 'handoff'); }, 'secondary')),
    h('nav', { class: 'tabs', 'aria-label': 'Grown-up area' }, tabs),
    l ? kids : h('p', { text: 'No reader yet.' }));
}

export function grownup(app, arg) {
  const [tab, id] = (arg || 'reports').split('/');
  switch (tab) {
    case 'report': return reportView(app, id);
    case 'progress': return progress(app);
    case 'interests': return interestsTab(app);
    case 'settings': return settings(app);
    case 'summary': return copySummary(app);
    case 'learners': return learners(app);
    default: return reports(app);
  }
}

function reports(app) {
  const l = app.learner();
  const qs = [...l.quests].reverse();
  return shell(app, 'reports',
    h('h1', { text: `Reports for ${l.nick}` }),
    qs.length ? h('ul', { class: 'report-list' }, qs.map(q => h('li', { class: 'card row-between' },
      h('div', {},
        h('p', { class: 'eyebrow', text: `${formatDate(q.at)}${q.kind === 'checkin' ? ', check-in' : ''}` }),
        h('p', { class: 'strong', text: passageTitle(app, q.passageId) }),
        h('p', { class: 'muted', text: `${subjectFor(q.subject).label}: ${q.right} of ${q.of} right, level ${q.levelStart} to ${q.levelEnd}` })),
      h('a', { class: 'btn secondary', href: `#/grownup/report/${q.id}`, text: GROWNUP.openReport })))) : h('p', { text: GROWNUP.noReports }));
}

function reportView(app, id) {
  const l = app.learner();
  const q = l.quests.find(x => x.id === id);
  if (!q) return reports(app);
  const label = q.interestId ? interestLabel(app, q.interestId) : null;
  const rep = buildReport(q, l.nick, { interestLabel: label });
  return shell(app, 'reports',
    h('a', { class: 'link back', href: '#/grownup/reports' }, icon('back'), GROWNUP.back),
    eyebrow(`Quest detail, ${formatDate(q.at)}`),
    h('h1', { text: passageTitle(app, q.passageId) }),
    h('ul', { class: 'pills' }, [l.nick, subjectFor(q.subject).label, `${q.right} of ${q.of} right`, label || topicLabel(app, q.topic), `Level ${q.levelStart} to ${q.levelEnd}`].map(t => h('li', { text: t }))),
    h('p', { class: 'headline', text: rep.headline }),
    h('p', { text: rep.level }),
    h('div', { class: 'card say' }, h('h2', { text: GROWNUP.sayTonight }), h('p', { class: 'big', text: rep.sayTonight })),
    h('h2', { text: GROWNUP.bySkill }),
    h('ul', { class: 'skills' }, rep.skills.map(sk => h('li', {}, h('span', { text: sk.name }), h('strong', { text: `${sk.right} of ${sk.of}` })))),
    h('h2', { text: GROWNUP.table }),
    h('div', { class: 'table-wrap', tabindex: 0, role: 'region', 'aria-label': GROWNUP.table },
      h('table', { class: 'qtable' },
        h('thead', {}, h('tr', {}, GROWNUP.cols.map(c => h('th', { scope: 'col', text: c })))),
        h('tbody', {}, rep.table.map(r => h('tr', {},
          h('td', { text: String(r.n) }),
          h('td', { text: r.skill }),
          h('td', { class: r.ok ? 'ok' : 'miss' }, icon(r.ok ? 'check' : 'cross'), r.result),
          h('td', { text: r.active }),
          h('td', {}, r.flags.length ? h('ul', { class: 'flags' }, r.flags.map(f => h('li', { text: f }))) : h('span', { class: 'muted', text: GROWNUP.none }))))))),
    h('h2', { text: GROWNUP.attention }),
    rep.attention.map(t => h('p', { text: t })),
    h('p', { class: 'muted', text: rep.honestNote }),
    h('h2', { text: GROWNUP.interest }),
    rep.interest.map(t => h('p', { text: t })),
    h('a', { class: 'link', href: '#/grownup/interests', text: GROWNUP.changeInterests }),
    h('h2', { text: GROWNUP.limits }),
    h('p', { class: 'muted', text: rep.limits }),
    rep.suspect ? h('p', { class: 'muted', text: rep.suspect }) : null,
    typeof window.print === 'function' ? button(GROWNUP.print, () => window.print(), 'secondary no-print') : null);
}

function skillLine(rows, subject) {
  const t = skillTotals(rows, subject);
  return skillsFor(subject).map(k => `${SKILL_NAMES[k]} ${t[k].right} of ${t[k].of}`);
}

function levelChart(quests) {
  const w = 300, hgt = 120, pad = 18, left = 52;
  const yFor = lv => hgt - pad - ((lv - 1) * (hgt - 2 * pad)) / (LEVEL_MAX - 1);
  const pts = quests.map((q, i) => [left + (quests.length === 1 ? 0 : (i * (w - left - pad)) / (quests.length - 1)), yFor(q.levelEnd)]);
  return s('svg', { class: 'chart', viewBox: `0 0 ${w} ${hgt}`, role: 'img', 'aria-label': `Level after each quest: ${quests.map(q => q.levelEnd).join(', ')}` },
    s('line', { x1: left, y1: hgt - pad, x2: w - pad, y2: hgt - pad, class: 'axis' }),
    [1, 6, LEVEL_MAX].map(lv => s('text', { x: left - 8, y: yFor(lv) + 4, class: 'tick', 'text-anchor': 'end', 'aria-hidden': 'true' }, `Level ${lv}`)),
    s('polyline', { points: pts.map(p => p.join(',')).join(' '), class: 'line', fill: 'none' }),
    pts.map((p, i) => s('circle', { cx: p[0], cy: p[1], r: 4, class: 'dot' }, s('title', {}, `Quest ${i + 1}: level ${quests[i].levelEnd}`))));
}

// Progress per subject: each subject has its own check-in, level line and before-and-after view.
function subjectProgress(app, l, subject) {
  const qs = l.quests.filter(q => (q.subject || 'reading') === subject);
  const label = subjectFor(subject).label;
  if (!qs.length) return [h('h2', { text: label }), h('p', { class: 'muted', text: GROWNUP.noReports })];
  const last5 = qs.slice(-5).flatMap(q => q.rows);
  const checkin = qs.find(q => q.kind === 'checkin');
  const after = qs.filter(q => q !== checkin);
  let compare = h('p', { class: 'muted', text: GROWNUP.notEnough });
  if (checkin && after.length) {
    const latest = after[after.length - 1];
    const last3 = after.slice(-3);
    const avgRight = (last3.reduce((n, q) => n + q.right, 0) / last3.length).toFixed(1);
    const cols = [
      { name: GROWNUP.checkin, right: `${checkin.right} of 8`, skills: skillLine(checkin.rows, subject) },
      { name: GROWNUP.latest, right: `${latest.right} of 8`, skills: skillLine(latest.rows, subject) },
      { name: GROWNUP.lastThree, right: `${avgRight} of 8`, skills: skillLine(last3.flatMap(q => q.rows), subject) }
    ];
    compare = h('div', { class: 'compare' }, cols.map(c => h('div', { class: 'card' }, h('h4', { text: c.name }), h('p', { class: 'strong', text: c.right }), h('ul', { class: 'plain' }, c.skills.map(t => h('li', { text: t }))))));
  }
  return h('section', { class: 'subject-progress' },
    h('h2', { text: `${label}: level ${levelOf(l, subject)}` }),
    h('h3', { text: GROWNUP.questList }),
    h('ul', { class: 'report-list' }, [...qs].reverse().map(q => h('li', { class: 'row-between line' },
      h('span', { text: `${formatDate(q.at)}: ${passageTitle(app, q.passageId)}` }),
      h('span', { class: 'muted', text: `${q.interestId ? interestLabel(app, q.interestId) : 'Mix'}, ${q.right} of 8, level ${q.levelStart} to ${q.levelEnd}` })))),
    h('h3', { text: GROWNUP.levelLine }), levelChart(qs),
    h('h3', { text: GROWNUP.lastFive }), h('ul', { class: 'skills' }, skillLine(last5, subject).map(t => h('li', { text: t }))),
    h('h3', { text: GROWNUP.beforeAfter }),
    compare);
}

function progress(app) {
  const l = app.learner();
  return shell(app, 'progress',
    h('h1', { text: `${GROWNUP.progressTitle} for ${l.nick}` }),
    learnerSubjects(l).map(subject => subjectProgress(app, l, subject)),
    h('p', { class: 'muted', text: PROGRESS_HONEST }));
}

function interestsTab(app) {
  const l = app.learner();
  const log = [...l.interestLog].reverse();
  const names = ids => (ids.length ? ids.map(id => interestLabel(app, id) || id).join(', ') : 'Surprise me');
  return shell(app, 'interests',
    h('h1', { text: `Subjects and interests for ${l.nick}` }),
    h('p', { text: C3.lead }),
    interestEditor(app, l, { mode: 'grownup', onDone: () => { app.flash = C3.saved; app.render(); } }),
    h('h2', { text: SUBJECTS_COPY.eyebrow }),
    h('p', { class: 'muted', text: SUBJECTS_COPY.lead }),
    subjectEditor(app, l, { mode: 'grownup', onDone: () => { app.flash = SUBJECTS_COPY.saved; app.render(); } }),
    h('h2', { text: GROWNUP.logTitle }),
    log.length ? h('ul', { class: 'plain log' }, log.map(e => h('li', { text: `${formatDate(e.at)}: ${names(e.from)} changed to ${names(e.to)}` }))) : h('p', { text: GROWNUP.logEmpty }),
    h('p', { class: 'muted small', text: 'Interests change only the topic of the next text. They never change a score, a level or how hard a text is.' }));
}

function settings(app) {
  const c = app.store.state.consent;
  return shell(app, 'settings',
    h('h1', { text: GROWNUP.tabs.settings }),
    h('div', { class: 'card' }, noticeView(app, 'h2'), c ? h('p', { class: 'muted small', text: GROWNUP.agreed(formatDate(c.at), c.noticeVersion) }) : null),
    h('p', { class: 'muted', text: CLIPBOARD_LINE }),
    h('h2', { text: SETTINGS_MEDIA.title }),
    toggle(app, 'motion', SETTINGS_MEDIA.motion, SETTINGS_MEDIA.motionHint),
    toggle(app, 'voice', SETTINGS_MEDIA.voice, SETTINGS_MEDIA.voiceHint),
    reminderSettings(app),
    h('h2', { text: GROWNUP.summaryTitle }),
    h('a', { class: 'btn secondary', href: '#/grownup/summary', text: GROWNUP.summaryOpen }),
    h('h2', { text: GROWNUP.clearTitle }),
    h('p', { text: GROWNUP.clearBody }),
    button(GROWNUP.clearButton, async () => {
      if (!(await confirmDialog(GROWNUP.clearConfirm, GROWNUP.clearBody, GROWNUP.clearYes, GROWNUP.clearNo))) return;
      app.dropQuest();
      app.store.clearAll();
      syncReminder(app); // the cleared settings turn the reminder off
      app.grownupOpen = false;
      app.lastQuest = null;
      app.go('welcome');
    }, 'danger'));
}

function toggle(app, key, label, hint) {
  const st = app.store.state;
  const box = h('input', { type: 'checkbox', id: `set-${key}`, checked: !!(st.settings && st.settings[key]), 'aria-describedby': `set-${key}-hint`,
    onchange: e => app.save({ ...app.store.state, settings: { ...app.store.state.settings, [key]: e.target.checked } }) });
  return h('div', { class: 'consent setting' }, box, h('div', {}, h('label', { for: `set-${key}`, text: label }), h('p', { class: 'hint', id: `set-${key}-hint`, text: hint })));
}

function copySummary(app) {
  const l = app.learner();
  const text = exportSummary(l); // the same text is shown and copied
  const box = h('textarea', { class: 'summary-box', readonly: true, rows: 12, id: 'summary-text', 'aria-describedby': 'summary-lead' });
  box.value = text;
  const msg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
  const copy = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard');
      await navigator.clipboard.writeText(text); // write only, after the parent's tap
      msg.textContent = GROWNUP.copied;
    } catch {
      msg.textContent = GROWNUP.copyBlocked;
      box.focus(); box.select();
    }
  };
  return shell(app, 'settings',
    h('a', { class: 'link back', href: '#/grownup/settings' }, icon('back'), GROWNUP.tabs.settings),
    h('h1', { text: GROWNUP.summaryTitle }),
    h('p', { id: 'summary-lead', class: 'strong', text: GROWNUP.summaryLead }),
    h('label', { for: 'summary-text', class: 'sr-only', text: 'Summary text' }),
    box,
    button(GROWNUP.copy, copy, 'primary', { id: 'copy-summary' }),
    msg);
}

function learners(app) {
  const st = app.store.state;
  return shell(app, 'learners',
    h('h1', { text: GROWNUP.tabs.learners }),
    st.learners.map(l => {
      const nick = h('input', { type: 'text', id: `nick-${l.id}`, value: l.nick, maxlength: 20, autocomplete: 'off', spellcheck: 'false' });
      const grade = h('select', { id: `grade-${l.id}` }, Array.from({ length: 12 }, (_, i) => h('option', { value: String(i + 1), selected: l.grade === i + 1, text: T2.gradeOption(i + 1) })));
      const msg = h('p', { class: 'msg', role: 'status', 'aria-live': 'polite' });
      const saveIt = () => {
        let n = checkNick(nick.value);
        if (n.ok && nickTaken(n.nick, st.learners, l.id)) n = { ok: false, reason: 'taken' };
        const g = checkGrade(grade.value);
        if (!n.ok) { msg.textContent = n.reason === 'long' ? T2.nickLong : n.reason === 'taken' ? T2.nickTaken : T2.nickError; nick.focus(); return; }
        app.store.updateLearner(l.id, x => {
          const renamed = { ...x, nick: n.nick };
          return g.grade === x.grade ? renamed : changeGrade(renamed, g.grade, app.data.INTERESTS, app.clock.nowIso());
        });
        app.flash = GROWNUP.saved;
        app.render();
      };
      return h('div', { class: 'card' },
        h('h2', { text: l.nick }),
        h('p', { class: 'muted small', text: `${learnerSubjects(l).map(x => `${subjectFor(x).label} level ${levelOf(l, x)}`).join(', ')}. ${l.quests.length} quests.` }),
        h('label', { for: `nick-${l.id}`, text: T2.nickLabel }), nick,
        h('label', { for: `grade-${l.id}`, text: T2.gradeLabel }), grade,
        h('p', { class: 'muted small', text: GROWNUP.gradeNote }),
        msg,
        h('div', { class: 'row-2' },
          button(GROWNUP.edit, saveIt, 'secondary'),
          button(GROWNUP.remove(l.nick), async () => {
            if (!(await confirmDialog(GROWNUP.removeConfirm(l.nick), null, GROWNUP.removeYes, GROWNUP.clearNo))) return;
            app.store.removeLearner(l.id);
            app.go(app.store.state.learners.length ? 'grownup/learners' : 'add');
          }, 'danger')));
    }),
    st.learners.length < MAX_LEARNERS ? button(GROWNUP.addAnother, () => app.go('add/more'), 'secondary block') : h('p', { text: T2.full }));
}
