// Every fixed sentence on the child's screens and the grown-up screens that is not part of the report.
// Plain words, short sentences. No urgency, no guilt, no claims. Praise names the work, never the child.

export const APP_NAME = 'Beacon';

export const BANNERS = {
  memoryOnly: 'Results will not be saved on this device.',
  newer: 'This device holds data from a newer version of Beacon. It has not been changed.',
  invalid: 'The data saved on this device could not be read. It has not been changed.',
  trimmed: 'This device was full, so the oldest quests were removed to make room.',
  otherTab: 'Beacon is open in another tab.',
  noBank: 'Beacon could not load the texts.'
};

export const T1 = {
  eyebrow: 'For the grown-up',
  title: 'Welcome to the Beacon test',
  lead: 'Beacon is a reading practice page. This test version sends nothing anywhere. Results stay in this browser, on this device, and you can clear them at any time.',
  leadApp: 'Beacon is a reading practice app. This test version sends nothing anywhere. Results stay in this app, on this device, and you can clear them at any time.',
  continue: 'Continue',
  blocked: 'Please tick the box to continue. It is fine to stop here if you do not agree.'
};

export const T2 = {
  eyebrow: 'For the grown-up',
  title: 'Add a reader',
  nickLabel: 'Nickname',
  nickHint: 'One word, letters only. A hyphen is fine.',
  nickError: 'A short nickname is enough. Please use one word, not a full name. Letters and a hyphen only.',
  nickLong: 'Please use 20 letters or fewer.',
  nickTaken: 'Another reader here already uses that nickname. Please pick a different one.',
  gradeLabel: 'Grade',
  gradeError: 'Please pick a grade.',
  gradeOption: g => `Grade ${g}`,
  note: 'No birthdate, photo or school name is needed.',
  submit: 'Add reader',
  full: 'Beacon holds up to 5 readers on one device.'
};

export const T3 = {
  eyebrow: 'For the grown-up',
  title: 'Hand the device to your child',
  body: [
    'Stay nearby, but please let your child read and answer without help.',
    'If they ask for help, you can say: "Try it your way."',
    'There is no clock on the screen. Your child can take their time.'
  ],
  button: 'Hand over'
};

// Pip's greeting by grade band (character bible voice).
export const C1 = {
  title: nick => `Hi, ${nick}. I am Pip.`,
  body: {
    'grades-1-2': ['I look for the tricky bits in stories.', 'We will read together. Then you answer some questions.'],
    'grades-3-5': ['I am a lookout. I help you spot the tricky bits in a text.', 'You read a short text, then answer eight questions. Take your time.'],
    'grades-6-8': ['I am Pip. I point out the parts worth a second look.', 'Short text, eight questions, no clock.'],
    'grades-9-12': ['Pip here. I flag the parts of a text worth checking.', 'One short text, eight questions, no time limit.']
  },
  next: 'Next',
  skip: 'Skip'
};

export const C2 = {
  title: 'What your grown-up sees',
  lead: 'After each quest, your grown-up sees a short report. It shows:',
  items: [
    'how many questions you got right',
    'how long each question took',
    'if you left the app',
    'if you copied or pasted something'
  ],
  after: 'It does not show what you typed. Everything stays on this device.',
  next: 'Got it',
  skip: 'Skip'
};

// The subject picker, shown before interests and before the first check-in.
export const SUBJECTS_COPY = {
  eyebrow: 'My subjects',
  title: 'What do you want to practice?',
  lead: 'Pick one or more. Each one starts with its own check-in.',
  counter: n => `${n} picked`,
  few: 'Pick at least one subject.',
  picked: (label, guide) => `${label} is on. ${guide} says hi.`,
  continue: 'Continue',
  save: 'Save subjects',
  saved: 'Saved. Each new subject starts with a check-in.',
  blurb: {
    reading: 'Stories and true texts, with Pip',
    math: 'Number stories and problems, with Tally',
    science: 'How the world works, with Fizz',
    social: 'People, places and the past, with Atlas'
  }
};

export const C3 = {
  eyebrow: 'My interests',
  title: 'What do you like?',
  lead: 'Pick 3 to 5. Your texts will be about them.',
  counter: n => `${n} of 5 picked`,
  surprise: 'Surprise me',
  surpriseOn: 'Surprise me is on. Your texts will be a mix.',
  few: 'Pick at least 3, or tap Surprise me.',
  many: 'You can pick up to 5. Tap one to take it off first.',
  continue: 'Continue',
  save: 'Save',
  skip: 'Skip for now',
  saved: 'Saved. Your next text will use these.'
};

export const CHECKIN = {
  eyebrow: 'Check-in',
  title: label => `First, a ${label.toLowerCase()} check-in`,
  body: 'It works like every other quest: read a short text, then answer eight questions. It helps Beacon pick texts that fit you.',
  start: 'Start the check-in'
};

export const C5 = {
  eyebrow: 'Your starting point',
  title: (n, label) => `Your ${label.toLowerCase()} starting point is level ${n}`,
  nextCheckin: label => `Next: the ${label.toLowerCase()} check-in`,
  right: (r, of) => `You got ${r} of ${of} in the check-in.`,
  work: 'One skill to work on next:',
  allStrong: 'Every skill looked solid. Next: keep reading.',
  next: 'Go to Today'
};

export const SKILL_KID = {
  central: { name: 'Central idea', tip: 'Ask yourself: what is this text mostly about?' },
  structure: { name: 'Text structure', tip: 'Look for words like first, then, because and so.' },
  monitor: { name: 'Monitor and clarify', tip: 'When something does not make sense, read that part again.' },
  vocab: { name: 'Vocabulary', tip: 'Use the words around a new word to work out what it means.' },
  number: { name: 'Number sense', tip: 'Read each number out loud. Which one is bigger, and by how much?' },
  operations: { name: 'Operations', tip: 'Write each step down before you pick an answer.' },
  problem: { name: 'Word problems', tip: 'Find what the problem asks for first, then pick the numbers you need.' },
  check: { name: 'Check and explain', tip: 'Ask yourself: does my answer make sense? Try it a second way.' }
};

// Shown with each question so a reader knows which skill is asked.
export const SKILL_EYEBROW = {
  central: 'Central idea',
  vocab: 'Vocabulary',
  structure: 'Text structure',
  monitor: 'Monitor and clarify',
  number: 'Number sense',
  operations: 'Operations',
  problem: 'Word problems',
  check: 'Check and explain'
};

export const TODAY = {
  eyebrow: "Today's quest",
  hello: nick => `Hi, ${nick}`,
  meta: 'About 10 minutes, 8 questions, no timer',
  picked: label => `Picked for you: ${label}`,
  mix: 'A mix today',
  repeat: 'This is a repeat. Tell your grown-up if you would like new ones.',
  subjectsLabel: 'Subjects',
  checkinFirst: label => `First, a ${label.toLowerCase()} check-in`,
  checkinStart: 'Start the check-in',
  start: 'Start quest',
  myInterests: 'My interests',
  interestsTitle: 'My interests',
  change: 'Change',
  surprise: 'Surprise me',
  level: n => `Level ${n}`,
  noTexts: label => `There are no ${label.toLowerCase()} texts yet.`,
  done: n => `${n} ${n === 1 ? 'quest' : 'quests'} finished`,
  grownups: 'Grown-ups',
  switchReader: 'Switch reader'
};

export const READ = {
  progress: 'Read first, then 8 questions',
  hint: 'Tap a word with dots under it for help.',
  ready: 'I am ready',
  stop: 'Stop for now',
  stopConfirm: 'Stop this quest? It will not be saved, and you can try this text again later.',
  stopYes: 'Yes, stop',
  stopNo: 'Keep going',
  helperFrom: 'From the text:',
  helperClose: 'Got it'
};

export const DUMP = {
  title: (guide = 'Pip') => `Tell ${guide} in one sentence what this was about.`,
  label: 'Your sentence',
  hint: 'This is just for you. Nobody sees what you type, and it is cleared when you move on.',
  done: 'Done',
  skip: 'Skip'
};

export const QUESTION = {
  progress: (i, n) => `Question ${i} of ${n}`,
  lookBack: 'Look back at the text',
  check: 'Check',
  choose: 'Pick an answer first.',
  choicesLabel: 'Answer choices',
  close: 'Back to the question'
};

export const FEEDBACK = {
  rightTitle: {
    'grades-1-2': 'You got it!',
    'grades-3-5': 'That is it.',
    'grades-6-8': 'Correct.',
    'grades-9-12': 'Correct.'
  },
  wrongTitle: {
    'grades-1-2': 'Not this one. That is OK.',
    'grades-3-5': 'Not this one. That is OK.',
    'grades-6-8': 'Not that one. Normal.',
    'grades-9-12': 'Not that one.'
  },
  rightAnswer: letter => `The answer is ${letter}:`,
  yourAnswer: 'Your answer',
  correctTag: 'Right answer',
  next: 'Next',
  finish: 'See how you did'
};

export const SUMMARY = {
  eyebrow: 'Quest done',
  title: 'You finished the quest.',
  score: (r, of) => `You got ${r} of ${of}.`,
  up: 'Next time the texts will be a little harder.',
  hold: 'Next time the texts will be about the same.',
  down: 'Next time the texts will be a little easier.',
  cap: 'You are at the top level. The texts stay at this level.',
  floor: 'Next time the texts will be about the same.',
  work: 'One skill to work on:',
  allStrong: 'Every skill looked solid today.',
  aboutTopic: label => `Did you like reading about ${label}?`,
  more: 'More like this',
  less: 'Less like this',
  moreDone: 'Got it. More like this is coming up next.',
  lessDone: 'Got it. Beacon will pick other topics for a few quests.',
  done: 'Done'
};

export const GATE = {
  title: 'For grown-ups',
  lead: 'Please answer this to open the grown-up area.',
  question: (a, b) => `What is ${a} times ${b}?`,
  wrong: 'That is not it. Here is a new one.',
  ok: 'OK',
  clear: 'Delete last number',
  cancel: 'Back',
  note: 'This keeps a young child from opening it by accident. It is not a lock.'
};

export const GROWNUP = {
  title: 'Grown-up area',
  tabs: { reports: 'Reports', progress: 'Progress', interests: 'Subjects and interests', settings: 'Settings and privacy', learners: 'Readers' },
  reader: 'Reader',
  handOver: 'Hand over to the reader',
  noReports: 'No finished quests yet. Reports appear here after each quest.',
  openReport: 'Open report',
  sayTonight: 'Say this tonight',
  bySkill: 'Results by skill',
  table: 'Each question',
  cols: ['#', 'Skill', 'Result', 'Active time', 'Flags'],
  none: 'none',
  attention: 'Attention',
  interest: 'Interest used',
  changeInterests: 'Change interests',
  limits: 'What Beacon cannot see',
  back: 'Back to reports',
  print: 'Print this report',
  progressTitle: 'Progress',
  questList: 'Quests, newest first',
  levelLine: 'Level after each quest',
  lastFive: 'Skills over the last 5 quests',
  beforeAfter: 'Before and after',
  checkin: 'First check-in',
  latest: 'Latest quest',
  lastThree: 'Average of the last 3',
  notEnough: 'Before and after appears once there is a check-in and at least one more quest.',
  logTitle: 'Interest changes',
  logEmpty: 'No changes yet.',
  noticeTitle: 'Privacy notice',
  agreed: (at, v) => `Agreed on this device on ${at}, notice version ${v}.`,
  summaryTitle: 'Copy summary',
  summaryOpen: 'Open Copy summary',
  summaryLead: 'This is everything that would be copied. Beacon does not send it anywhere. If you choose to send it to us, you do that yourself.',
  copy: 'Copy',
  copied: 'Copied to this device\'s clipboard. Nothing was sent.',
  copyBlocked: 'This browser did not allow copying. You can select the text in the box instead.',
  clearTitle: 'Clear data',
  clearBody: 'This deletes everything Beacon saved on this device. Beacon has no copy anywhere else.',
  clearButton: 'Clear data',
  clearConfirm: 'Delete everything Beacon saved on this device?',
  clearYes: 'Yes, delete everything',
  clearNo: 'Cancel',
  removeTitle: 'Remove one reader',
  remove: nick => `Remove ${nick}`,
  removeConfirm: nick => `Delete ${nick} and all of their results from this device?`,
  removeYes: 'Yes, remove',
  edit: 'Save changes',
  saved: 'Saved.',
  addAnother: 'Add another reader',
  gradeNote: 'Changing the grade changes the interest list. It does not change the level.'
};

export const FOOTER_NOTE = 'Draft for a private test.';

// The word helper (src/ui/word-help.js). Kind, short, never a test.
export const WORDS = {
  eyebrow: 'Word help',
  askLabel: 'what does this mean?',
  askAbout: w => `What does "${w}" mean?`,
  notInList: 'Beacon does not have help for this word yet. Read the sentence around it for clues.',
  whatDoesItMean: 'What does this mean?',
  hearQuestion: 'Hear it',
  guessHint: 'Take a guess. Any answer is fine. Then see what it means.',
  notSure: 'Not sure yet',
  soundItOut: 'Sound it out',
  syllablesLabel: n => `${n} ${n === 1 ? 'part' : 'parts'}`,
  sayIt: 'Say it:',
  hearIt: 'Hear it',
  sayItSlowly: 'Say it slowly',
  soundTip: 'Sound tip:',
  whatItMeans: 'What it means',
  hearMeaning: 'Hear the meaning',
  fromText: 'From the text:',
  wordsLikeThis: 'Words like this',
  opposites: 'Opposite',
  wordParts: 'Word parts',
  partMeans: 'means',
  gotIt: 'Got it'
};

// Milestones (src/engine/milestones.js). They name the work, never the child, and never a rank.
export const MILESTONES = {
  title: 'My milestones',
  none: 'Milestones show up here as you read and practice.',
  open: 'My milestones',
  label(id, subjectLabel) {
    let m;
    if (id === 'first-checkin') return 'First check-in done';
    if ((m = /^first-quest-(\w+)$/.exec(id))) return `First ${subjectLabel(m[1]).toLowerCase()} quest done`;
    if ((m = /^level-up-(\w+)$/.exec(id))) return `${subjectLabel(m[1])} level went up for the first time`;
    if ((m = /^quests-(\d+)$/.exec(id))) return `${m[1]} quests finished`;
    if (id === 'look-back-3') return 'Looked back at the text to check, 3 times';
    if ((m = /^words-(\d+)$/.exec(id))) return `Used the word helper ${m[1]} times`;
    if (id === 'two-subjects') return 'Practicing more than one subject';
    return 'A new milestone';
  }
};

// Celebrations: short, calm, about the work. They appear between quests, never during a question.
export const CELEBRATE = {
  levelUpTitle: label => `Your ${label.toLowerCase()} level went up`,
  levelUpBody: n => `You are now at level ${n}. Lumi's light reaches a little further.`,
  milestoneTitle: 'New milestone',
  keepGoing: 'Keep going',
  subjectReady: (label, guide) => `${label} is ready. ${guide} will help.`
};

export const SETTINGS_MEDIA = {
  title: 'Movement and voice',
  motion: 'Let the characters move in their scenes',
  motionHint: 'They move only between questions, never while your child is answering. Devices set to reduce motion keep them still.',
  voice: 'Recorded voice in the word helper',
  voiceHint: 'The voice plays only when your child taps a sound button. The recordings are part of this page; nothing is sent anywhere.'
};

// Coming back (logic spec section 19). Rewards name the reading, never the child, and never mention a missed day.
export const RETENTION = {
  weekTitle: 'This week',
  weekDays: (n, goal) => `${Math.min(n, goal)} of ${goal} reading days`,
  weekMet: "This week's reading goal is done.",
  weekHint: 'A reading day is any day with a finished quest.',
  total: n => `${n} ${n === 1 ? 'reading day' : 'reading days'} so far`,
  keepsakeToday: name => `Today's keepsake: ${name}`,
  keepsakeHint: 'Each day you finish a quest, you find a keepsake.',
  pathOpen: "Lumi's cliff and keepsakes",
  pathTitle: "Lumi's cliff",
  pathLead: "Every text you finish is a step on Lumi's path. Some steps add something new to her cliff.",
  pathNext: (name, left) => `Next on the cliff: ${name}, after ${left} more ${left === 1 ? 'text' : 'texts'}.`,
  pathAll: 'Everything is on the cliff now.',
  pathDone: n => `${n} ${n === 1 ? 'text' : 'texts'} finished`,
  shelfTitle: 'My keepsakes',
  shelfNone: 'Keepsakes show up here, one for each reading day.',
  foundKeepsake: name => `You found a keepsake: ${name}.`,
  newOnCliff: name => `New on Lumi's cliff: ${name}.`,
  stopHere: "That's today's reading. You can stop here or read another.",
  itemNames: {
    flowers: 'a patch of flowers', gull: 'two seagulls', kite: 'a kite', sailboat: 'a sailboat', bunting: 'a string of flags',
    telescope: 'a telescope', cottage: 'a little cottage', whale: 'a whale', balloon: 'a hot air balloon', moon: 'the moon and a bright star'
  },
  keepsakeNames: {
    shell: 'a spiral shell', starfish: 'a starfish', 'sea-glass': 'a piece of sea glass', feather: 'a feather',
    pebble: 'a smooth pebble', acorn: 'an acorn', leaf: 'a red leaf', 'sand-dollar': 'a sand dollar'
  }
};

// The grown-up's daily reminder, in the iPad and Android apps only (logic spec section 19).
export const REMINDER = {
  title: 'Daily reminder',
  label: 'Show one reminder a day on this tablet',
  hint: 'Off unless you turn it on. One quiet notification a day at the time you choose, set on this tablet. Nothing is sent anywhere. The first time, the tablet asks you to allow notifications for Beacon.',
  time: 'Time of day',
  hourLabel: hr => (hr === 12 ? '12 noon' : `${hr > 12 ? hr - 12 : hr} ${hr < 12 ? 'a.m.' : 'p.m.'}`),
  notification: 'A short Beacon reading, whenever you are ready.'
};
