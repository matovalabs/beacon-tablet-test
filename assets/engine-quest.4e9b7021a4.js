// Quest run: logic spec section 7. reading -> dump -> q1 ... q8 (each with feedback) -> summary.
// The quest lives in memory until it finishes. An unfinished quest is dropped and changes nothing.
import { QUEST_QUESTIONS } from './engine-constants.f6f2fc2188.js';
import { subjectFor, subjectOf } from './engine-subjects.b9c5ff3bf4.js';
import { levelOf, nextQuestNumber } from './engine-select.dcc6fcf48a.js';
import { nextLevel } from './engine-levels.3311cee783.js';

export class QuestRun {
  constructor({ learner, choice, kind, telemetry, clock, newId }) {
    this.learnerId = learner.id;
    this.n = nextQuestNumber(learner);
    this.kind = kind;
    this.choice = choice;
    this.passage = choice.passage;
    this.subject = choice.subject || subjectOf(choice.passage);
    this.order = subjectFor(this.subject).order;
    this.levelStart = levelOf(learner, this.subject);
    this.telemetry = telemetry;
    this.clock = clock;
    this.newId = newId || (() => globalThis.crypto.randomUUID());
    this.phase = 'reading';
    this.qi = 0;
    this.rows = [];
    this.picked = [];
    if (!this.passage || !Array.isArray(this.passage.questions) || this.passage.questions.length !== QUEST_QUESTIONS) {
      throw new Error('A quest needs exactly 8 questions');
    }
    telemetry.start();
  }

  get question() { return this.passage.questions[this.qi]; }

  ready() {
    if (this.phase === 'reading') this.phase = 'dump';
  }

  dumpDone(chars) {
    if (this.phase !== 'dump') return;
    this.telemetry.dumpDone(chars);
    this.showQuestion();
  }

  dumpSkip() {
    if (this.phase !== 'dump') return;
    this.telemetry.dumpSkip();
    this.showQuestion();
  }

  showQuestion() {
    this.phase = 'question';
    this.telemetry.questionShown(this.qi + 1);
  }

  // Locks the answer. Returns null when nothing is chosen or the answer is already locked.
  check(choiceIndex) {
    if (this.phase !== 'question' || !Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex > 3) return null;
    const q = this.question;
    const ok = choiceIndex === q.a;
    const row = this.telemetry.answer({ n: this.qi + 1, skill: this.order[this.qi], ok, testedWord: q.skill === 'vocab' ? q.word : null });
    this.rows.push(row);
    this.picked.push(choiceIndex);
    this.phase = 'feedback';
    return { ok, correct: q.a, why: q.why };
  }

  next() {
    if (this.phase !== 'feedback') return;
    if (this.qi + 1 < QUEST_QUESTIONS) {
      this.qi += 1;
      this.showQuestion();
    } else {
      this.phase = 'summary';
    }
  }

  // Builds the saved quest once all 8 are answered. Score and level come from right answers only.
  finish() {
    if (this.phase !== 'summary' || this.rows.length !== QUEST_QUESTIONS) throw new Error('The quest is not finished');
    this.telemetry.stop();
    const right = this.rows.filter(r => r.ok).length;
    const quest = {
      id: this.newId(),
      n: this.n,
      at: this.clock.nowIso(),
      kind: this.kind,
      subject: this.subject,
      passageId: this.passage.id,
      topic: this.passage.topic,
      interestId: this.choice.interestId,
      repeat: !!this.choice.repeat,
      levelStart: this.levelStart,
      levelEnd: nextLevel(this.levelStart, right, QUEST_QUESTIONS),
      right,
      of: QUEST_QUESTIONS,
      rows: this.rows,
      attention: this.telemetry.attention(this.rows)
    };
    this.telemetry.discard();
    this.picked = [];
    return quest;
  }

  // Dropped: nothing is scored or saved.
  abandon() {
    this.telemetry.discard();
    this.phase = 'dropped';
  }
}
