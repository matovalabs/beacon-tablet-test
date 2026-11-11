// Timing and attention signals: logic spec section 8.
// The clock is injected so tests can drive it. Raw events stay in memory only for the running
// quest and are dropped when the quest ends. Nothing here ever holds text a child typed or copied.
import {
  AWAY_BLUR_MIN_MS, LONG_ABSENCE_MS, COPY_MIN_CHARS, FAST_WRONG_MS, MAX_AWAY_MS, CLOCK_SKEW_MS
} from './engine-constants.f6f2fc2188.js';

const REGIONS = ['passage', 'question', 'choice', 'other'];

export function mergeIntervals(list) {
  const sorted = list.map(i => [i[0], i[1]]).sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
    else out.push(iv);
  }
  return out;
}

const overlap = (iv, a, b) => Math.max(0, Math.min(iv[1], b) - Math.max(iv[0], a));

export class Telemetry {
  constructor(clock) {
    this.clock = clock;
    this.running = false;
    this.reset();
  }

  reset() {
    this.intervals = [];
    this.open = null; // { start, kind: 'hidden' | 'blur' }
    this.copies = []; // { t, len, element }
    this.helper = []; // { t, word }
    this.windows = []; // { n, shown, answered }
    this.current = null; // { n, shown, wallShown, lookedBack }
    this.pasteCount = 0;
    this.pasteChars = 0;
    this.dumpChars = null;
    this.dumpSkipped = false;
  }

  start() { this.reset(); this.running = true; }
  stop() { this.closeAway(); this.running = false; }
  // Drops every raw event. Called when a quest ends, finished or not.
  discard() { this.reset(); this.running = false; }

  // Leaving the app (8.2)
  hidden() {
    if (!this.running) return;
    const now = this.clock.mono();
    if (this.open) this.open.kind = 'hidden'; // a blur followed by hidden is one interval
    else this.open = { start: now, kind: 'hidden' };
  }
  blur() {
    if (!this.running || this.open) return;
    this.open = { start: this.clock.mono(), kind: 'blur' };
  }
  visible() { this.closeAway(); }
  closeAway() {
    if (!this.open) return;
    const now = this.clock.mono();
    const dur = now - this.open.start;
    const counts = this.open.kind === 'hidden' || dur > AWAY_BLUR_MIN_MS;
    if (counts && dur > 0) this.intervals.push([this.open.start, this.open.start + Math.min(dur, MAX_AWAY_MS)]);
    this.open = null;
  }

  // Copy (8.3). The caller passes only a length and a region name, never the text.
  copy(len, element) {
    if (!this.running || !(len >= COPY_MIN_CHARS)) return;
    this.copies.push({ t: this.clock.mono(), len, element: REGIONS.includes(element) ? element : 'other' });
  }

  // Paste into the brain dump (8.4): a length only.
  paste(len) {
    if (!this.running || !(len > 0)) return;
    this.pasteCount += 1;
    this.pasteChars += len;
  }

  dumpDone(chars) { if (this.running) { this.dumpChars = chars; this.dumpSkipped = false; } }
  dumpSkip() { if (this.running) { this.dumpChars = null; this.dumpSkipped = true; } }

  helperTap(word) {
    if (!this.running) return;
    this.helper.push({ t: this.clock.mono(), word: String(word).toLowerCase() });
  }

  questionShown(n) {
    if (!this.running) return;
    this.current = { n, shown: this.clock.mono(), wallShown: this.clock.wall(), lookedBack: 0 };
  }

  lookBack() { if (this.running && this.current) this.current.lookedBack += 1; }

  // Builds the row for the question on screen. testedWord is the vocab question's "word", else null.
  answer({ n, skill, ok, testedWord = null }) {
    const c = this.current;
    if (!this.running || !c || c.n !== n) throw new Error('No question is on screen');
    this.closeAway();
    const answered = this.clock.mono();
    const wallAnswered = this.clock.wall();
    const totalMs = Math.max(0, answered - c.shown);
    let awayMs = 0, awayCount = 0, longestAwayMs = 0;
    for (const iv of mergeIntervals(this.intervals)) {
      const o = overlap(iv, c.shown, answered);
      if (o > 0) { awayMs += o; awayCount += 1; longestAwayMs = Math.max(longestAwayMs, o); }
    }
    const activeMs = Math.max(0, totalMs - awayMs);
    const inWin = this.copies.filter(x => x.t >= c.shown && x.t <= answered);
    const copy = inWin.length ? { count: inWin.length, maxLen: Math.max(...inWin.map(x => x.len)), elements: inWin.map(x => x.element) } : null;
    const helperTaps = this.helper.filter(x => x.t >= c.shown && x.t <= answered).length;
    const helperOnTested = testedWord ? this.helper.some(x => x.t <= answered && x.word === String(testedWord).toLowerCase()) : false;
    const suspect = Math.abs((wallAnswered - c.wallShown) - (answered - c.shown)) > CLOCK_SKEW_MS;
    this.windows.push({ n, shown: c.shown, answered });
    this.current = null;
    return {
      n, skill, ok: !!ok, activeMs: Math.round(activeMs), totalMs: Math.round(totalMs),
      awayCount, awayMs: Math.round(awayMs), longestAwayMs: Math.round(longestAwayMs),
      copy, lookedBack: c.lookedBack, helperTaps, helperOnTested,
      fastMiss: !ok && activeMs < FAST_WRONG_MS, suspect
    };
  }

  // Quest totals, including time away while reading or between questions.
  attention(rows) {
    this.closeAway();
    const ivs = mergeIntervals(this.intervals);
    let awayMs = 0, longestAwayMs = 0, longestAwayQ = null;
    for (const iv of ivs) {
      const d = iv[1] - iv[0];
      awayMs += d;
      if (d > longestAwayMs) {
        longestAwayMs = d;
        const w = this.windows.find(win => overlap(iv, win.shown, win.answered) > 0);
        longestAwayQ = w ? w.n : null;
      }
    }
    const dumpChars = this.dumpSkipped ? null : this.dumpChars;
    const pasteShare = dumpChars && dumpChars > 0 ? Math.min(100, Math.round(100 * this.pasteChars / dumpChars)) : null;
    return {
      awayCount: ivs.length, awayMs: Math.round(awayMs), longestAwayMs: Math.round(longestAwayMs), longestAwayQ,
      copyCount: this.copies.length, copyElements: this.copies.map(x => x.element),
      pasteCount: this.pasteCount, pasteChars: this.pasteChars, pasteShare,
      dumpChars, dumpSkipped: this.dumpSkipped,
      suspectCount: rows.filter(r => r.suspect).length
    };
  }

  static isLongAbsence(ms) { return ms > LONG_ABSENCE_MS; }
}
