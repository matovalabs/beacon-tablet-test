// Every constant from the logic spec sections 3, 4, 6 and 8, in one place.

// Section 4: levels and scoring
export const LEVEL_MIN = 1;
// Levels 1 to 12 match grades 1 to 12 (changed from 10 levels on November 10, 2026).
export const LEVEL_MAX = 12;
export const UP_AT = 0.85;
export const DOWN_BELOW = 0.60;
export const QUEST_QUESTIONS = 8;
export const SKILL_ORDER = ['central', 'vocab', 'structure', 'structure', 'monitor', 'central', 'vocab', 'monitor'];
export const SKILLS = ['central', 'structure', 'monitor', 'vocab'];
// Section 10.3: tie order for "Say this tonight"
export const SKILL_TIE_ORDER = ['monitor', 'central', 'structure', 'vocab'];
export const STRONG_AT = 0.85;

// Section 8: timing and signals
export const AWAY_BLUR_MIN_MS = 2000;
export const LONG_ABSENCE_MS = 30000;
export const COPY_MIN_CHARS = 20;
export const FAST_WRONG_MS = 4000;
export const MAX_AWAY_MS = 7200000;
export const CLOCK_SKEW_MS = 5000;

// Section 3: storage
export const STORAGE_KEY = 'beacon.test.v1';
// Holds only a random tab id while a quest runs, so two tabs can pause each other (section 13).
export const TAB_KEY = 'beacon.test.v1.tab';
export const STATE_VERSION = 4;
export const NOTICE_VERSION = 'T-2026-10-10';
// The notice inside the iPad and Android apps (src/text/notice.js) has its own version.
export const APP_NOTICE_VERSION = 'T-2026-10-21-app';
export const MAX_LEARNERS = 5;
// Section 19: the grown-up's daily reminder, daytime hours only (8 a.m. to 7 p.m.).
export const REMINDER_FIRST_HOUR = 8;
export const REMINDER_LAST_HOUR = 19;
export const REMINDER_DEFAULT_HOUR = 16;
export const MAX_QUESTS = 200;
export const MAX_INTEREST_LOG = 50;

// Section 6: interests
export const INTEREST_MIN = 3;
export const INTEREST_MAX = 5;
export const LESS_SKIP_QUESTS = 3;

// Section 5 step 4.5: how far from the level "nearest unseen level" may reach before a repeat.
// The spec says "everything near is seen"; we read "near" as within 2 levels.
export const NEAR_LEVELS = 2;

// Section 9: brain dump
export const DUMP_MAX_CHARS = 280;

// Section 2 T2: nickname
export const NICK_MAX = 20;
