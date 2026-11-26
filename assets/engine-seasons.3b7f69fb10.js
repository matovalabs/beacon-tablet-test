// Seasonal and holiday looks for the guides (logic spec section 17, "Seasons and holidays", version 0.8).
// Pure: no DOM and no clock. The caller passes the device's local day as "YYYY-MM-DD" (retention.localDay).
//
// Seasons follow a fixed table of local dates, the same everywhere (no hemisphere detection):
// autumn September 22 to December 20, winter December 21 to March 19, spring March 20 to June 20,
// summer June 21 to September 21. Seasonal looks are always on.
//
// Holidays are off until a grown-up switches one on. A chosen holiday's look replaces the season's look
// during its window, a few days around the date (WINDOWS below, 4 to 7 days each). Fixed-date holidays repeat
// every year. Moving holidays come only from the MOVING table, 2026 to 2030; after 2030 they show nothing.

export const SEASONS = ['autumn', 'winter', 'spring', 'summer'];

// The holiday list in the order the grown-up sees it. Names live in src/text/copy.js (HOLIDAYS_COPY).
export const HOLIDAY_IDS = ['new-year', 'lunar-new-year', 'valentines', 'eid-al-fitr', 'easter', 'juneteenth', 'july-4', 'diwali', 'halloween', 'thanksgiving', 'hanukkah', 'christmas', 'kwanzaa'];

// Fixed dates, as month and day.
const FIXED = { 'new-year': [1, 1], valentines: [2, 14], juneteenth: [6, 19], 'july-4': [7, 4], halloween: [10, 31], christmas: [12, 25], kwanzaa: [12, 26] };

// Moving dates, 2026 to 2030. Each was checked against the source named beside it on November 25, 2026
// (also listed in docs/drafting-notes.md). The date is the main day (for Hanukkah, the first evening).
export const MOVING = {
  // Hong Kong Observatory, Gregorian-Lunar Calendar Conversion Table 2026 (hko.gov.hk) for 2026;
  // Royal Museums Greenwich (Royal Observatory), "Lunar New Year dates" (rmg.co.uk) for 2027 to 2030.
  'lunar-new-year': { 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-02' },
  // City University of New York, Religions and Ethnic Holiday Calendar (cuny.edu): the day after the evening
  // it begins. Dates can move a day with the moon sighting; the window covers that.
  'eid-al-fitr': { 2026: '2026-03-20', 2027: '2027-03-10', 2028: '2028-02-27', 2029: '2029-02-15', 2030: '2030-02-05' },
  // US Census Bureau, "Easter Dates from 1600 to 2099" (census.gov). Western Easter Sunday.
  easter: { 2026: '2026-04-05', 2027: '2027-03-28', 2028: '2028-04-16', 2029: '2029-04-01', 2030: '2030-04-21' },
  // City University of New York, Religions and Ethnic Holiday Calendar (cuny.edu). Fairfax County Public
  // Schools (fcps.edu) lists 2027 as October 29; the window covers both days.
  diwali: { 2026: '2026-11-08', 2027: '2027-10-28', 2028: '2028-10-17', 2029: '2029-11-05', 2030: '2030-10-25' },
  // US Office of Personnel Management, Federal Holidays (opm.gov), and the Naval Observatory rule
  // (aa.usno.navy.mil/faq/holidays): the fourth Thursday in November.
  thanksgiving: { 2026: '2026-11-26', 2027: '2027-11-25', 2028: '2028-11-23', 2029: '2029-11-22', 2030: '2030-11-28' },
  // Chabad.org, "When Is Hanukkah Celebrated in 2026 to 2030", matched by Hebcal (hebcal.com) and, for 2026
  // to 2028, Fairfax County Public Schools (fcps.edu). The first candle is lit that evening.
  hanukkah: { 2026: '2026-12-04', 2027: '2027-12-24', 2028: '2028-12-12', 2029: '2029-12-01', 2030: '2030-12-20' }
};
export const TABLE_FIRST_YEAR = 2026;
export const TABLE_LAST_YEAR = 2030;

// Each window: days before and days after the date, both included.
export const WINDOWS = {
  'new-year': [1, 2],        // December 31 to January 3
  'lunar-new-year': [2, 4],  // 7 days
  valentines: [3, 0],        // February 11 to 14
  'eid-al-fitr': [1, 2],     // 4 days
  easter: [3, 1],            // Thursday to Monday
  juneteenth: [2, 1],        // June 17 to 20
  'july-4': [3, 1],          // July 1 to 5
  diwali: [2, 2],            // 5 days
  halloween: [6, 0],         // October 25 to 31
  thanksgiving: [3, 1],      // Monday to Friday
  hanukkah: [0, 6],          // the first 7 days
  christmas: [5, 1],         // December 20 to 26
  kwanzaa: [0, 6]            // December 26 to January 1
};

const pad = n => String(n).padStart(2, '0');
const toNum = day => { const [y, m, d] = day.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const fromNum = n => { const t = new Date(n * 86400000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
const VALID = /^\d{4}-\d{2}-\d{2}$/;

export function seasonFor(day) {
  if (!VALID.test(day || '')) return null;
  const [, m, d] = day.split('-').map(Number);
  const md = m * 100 + d;
  if (md >= 922 && md <= 1220) return 'autumn';
  if (md >= 1221 || md <= 319) return 'winter';
  if (md >= 320 && md <= 620) return 'spring';
  return 'summer';
}

// The main date of a holiday in a year, or null (a moving holiday outside the table).
export function holidayDate(id, year) {
  if (FIXED[id]) return `${year}-${pad(FIXED[id][0])}-${pad(FIXED[id][1])}`;
  const t = MOVING[id];
  return t && t[year] ? t[year] : null;
}

// How many days a holiday's window is from a day: 0 inside it, null when the day is not in any window.
// Looks at the year before, the same year and the year after, so windows that cross January 1 work.
export function holidayDistance(id, day) {
  if (!WINDOWS[id] || !VALID.test(day || '')) return null;
  const n = toNum(day);
  const y = Number(day.slice(0, 4));
  let best = null;
  for (const year of [y - 1, y, y + 1]) {
    const date = holidayDate(id, year);
    if (!date) continue;
    const c = toNum(date);
    const [before, after] = WINDOWS[id];
    if (n >= c - before && n <= c + after) {
      const dist = Math.abs(n - c);
      if (best === null || dist < best) best = dist;
    }
  }
  return best;
}

// The window of a holiday that holds a date in a year, as first and last day (for docs and tests).
export function holidayWindow(id, year) {
  const date = holidayDate(id, year);
  if (!date) return null;
  const c = toNum(date);
  return { first: fromNum(c - WINDOWS[id][0]), date, last: fromNum(c + WINDOWS[id][1]) };
}

// Only known ids, each once, in list order. Anything else in saved data is dropped.
export function cleanHolidays(list) {
  if (!Array.isArray(list)) return [];
  return HOLIDAY_IDS.filter(id => list.includes(id));
}

// The look for a day: { kind: 'holiday', id } when a chosen holiday's window holds the day (the nearest date
// wins if two overlap, then list order), otherwise { kind: 'season', id }. Holidays nobody chose never show.
export function lookFor(day, chosen = []) {
  let best = null, bestDist = null;
  for (const id of cleanHolidays(chosen)) {
    const d = holidayDistance(id, day);
    if (d !== null && (bestDist === null || d < bestDist)) { best = id; bestDist = d; }
  }
  if (best) return { kind: 'holiday', id: best };
  const s = seasonFor(day);
  return s ? { kind: 'season', id: s } : null;
}
