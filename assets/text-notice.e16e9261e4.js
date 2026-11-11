// The privacy notice, version T-2026-10-10: 03-test-protocol-and-privacy.md section 4, word for word.
// Counsel edits before use. Business details come from config/site.json through the build.
// The host email-code paragraph is a build setting (HOST_ACCESS_NOTICE), so a family never sees a bracketed choice.
// The iPad and Android apps (site.app, set by tools/build-native.mjs) have no browser and no website host, so their
// notice says "this app" and says what TestFlight shares instead. Drafted October 21, 2026; counsel edits it too.
import { NOTICE_VERSION, APP_NOTICE_VERSION } from './engine-constants.f6f2fc2188.js';

export const NOTICE_TITLE = 'About this test of Beacon';
export const COOKIE_LINE = "This page sets no cookies of its own. It saves your child's results in this browser's storage, which you can clear.";
const APP_STORAGE_LINE = "The app sets no cookies. It saves your child's results in its own storage on this device, which you can clear.";
export const CONSENT_LABEL = 'I am the parent or guardian, and I agree that my child can try this.';

export const noticeVersion = site => (site.app ? APP_NOTICE_VERSION : NOTICE_VERSION);
export const storageLine = site => (site.app ? APP_STORAGE_LINE : COOKIE_LINE);

const APP_COLLECT = "Nothing. This app does not send anything to us or to anyone else, and it does not use the internet. The nickname you type (use a nickname, not a full name), your child's grade, interests and results are saved only in this app, on this device. We cannot see them. In the Grown-up area there is a Copy summary button. It shows you the exact text first, with no name in it, and copies it only when you tap Copy. Nothing is sent. If you choose to send that text to us, you do that yourself.";
const APP_CONTROL = 'You can clear everything at any time in the Grown-up area, under Settings and privacy. Clearing removes the data from this device, and so does deleting the app. We keep no copy.';
const APP_DELIVERY = { h: 'How the app reached you.', p: "On an iPad or iPhone, Apple's TestFlight app delivers this test. Apple then shares with us when Beacon was installed, how many times it was opened and any crash reports, but not your name or email address. If you send feedback through TestFlight, we see what you send, including any screenshot. On an Android or Fire tablet, the app file we sent you shares nothing. None of this includes your child's answers or results, unless a screenshot you send shows them." };

export function noticeBlocks(site) {
  const blocks = [
    { p: `Beacon is a reading practice tool for children. This is an early test version, made by ${site.legalName}, ${site.postalAddress}. You can reach us at ${site.contactEmail}.` },
    { h: 'What it does.', p: 'Your child reads short texts, answers eight questions, and picks interests so the next texts feel more fun. You see a report with the score, how long each question took, whether your child left the app, and whether they copied or pasted anything.' },
    { h: 'What we collect.', p: site.app ? APP_COLLECT : "Nothing. This page does not send anything to us or to anyone else. The nickname you type (use a nickname, not a full name), your child's grade, interests and results are saved only in this browser, on this device. We cannot see them. In the Grown-up area there is a Copy summary button. It shows you the exact text first, with no name in it, and copies it only when you tap Copy. Nothing is sent. If you choose to send that text to us, you do that yourself." },
    { h: 'What the report cannot tell you.', p: 'It is a signal, not proof. A phone call, a notification or a sibling can cause what it shows. Beacon cannot see other devices, books or a person sitting beside your child. Beacon does not read what is on the clipboard. It records that a paste happened and how long it was, not what it said.' },
    { h: 'Your control.', p: site.app ? APP_CONTROL : 'You can clear everything at any time in the Grown-up area, under Settings and privacy. Clearing removes the data from this device. We keep no copy.' },
    site.app ? APP_DELIVERY : { h: 'The website host.', p: 'The service that hosts this page may keep standard visit logs, such as the time, the network address that asked for the page and the type of browser. We do not use these logs for anything about your child.' }
  ];
  if (site.hostAccessNotice && !site.app) {
    blocks.push({ p: 'To keep the link private, the host asks you to confirm your email address with a one-time code and keeps a sign-in cookie in your browser for that. The page itself sets no cookies.' });
  }
  blocks.push(
    { h: 'This is a test.', p: 'It is free. Nothing is sold. It may contain mistakes. It does not replace a teacher or a tutor, and it makes no promise about grades or test scores.' },
    { p: "By ticking the box you confirm you are the child's parent or guardian and you agree that your child can try Beacon on this device." },
    { p: `Notice version ${noticeVersion(site)}.` }
  );
  return blocks;
}

// Terms of the test: a DRAFT for counsel to write. It says only what 03 section 5 lists.
export const TERMS_TITLE = 'Terms of the test';
export function termsBlocks(site) {
  return [
    { p: 'Draft for counsel. Not final wording.' },
    { h: 'What this is.', p: `This is a free test of Beacon, a reading practice page, run by ${site.legalName}, ${site.postalAddress}.` },
    { h: 'Who uses it.', p: 'A parent or guardian lets their own child use it, on their own device, after reading the privacy notice.' },
    { h: 'Free.', p: 'There is no price, no payment and no billing, so there is nothing to refund.' },
    { h: 'No promises.', p: 'The test may contain mistakes. It does not replace a teacher or a tutor, and it makes no promise about grades or test scores.' },
    { h: 'Your data.', p: storageLine(site) + ' Clear data in the Grown-up area removes everything.' },
    { h: 'Stopping.', p: 'You can stop at any time. We may stop the test at any time.' },
    { h: 'Contact.', p: `Write to ${site.contactEmail}.` }
  ];
}
