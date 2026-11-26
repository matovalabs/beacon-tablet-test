// Prepared mouth shapes for the word helper's guide (logic spec section 17.2). The helper shows the "think"
// drawing; these shapes sit over its mouth (or Pip's beak) and the page swaps between them while the
// recorded voice plays. Flat fills in each guide's own mouth color, as in the character bible.
//
// MOUTH_SPOT: where the think drawing's mouth is, in its 200 by 240 art units: [x, y, width]. Measured from
// ../beacon-characters/source/beacon_chars.py (its mouth() call, and Pip's beak line), including each band's
// scale and the think drawing's 4 degree tilt (MOUTH_TILT).
export const MOUTH_TILT = -4;
export const MOUTH_SPOT = {
  'grades-1-2': { pip: [95.7, 147.7, 11.3], lumi: [98.9, 107.4, 11.1], tally: [87.9, 184.9, 12.1], fizz: [94.3, 132.3, 12.6], atlas: [93.4, 118.6, 11.5] },
  'grades-3-5': { pip: [93.6, 120.1, 10.1], lumi: [99.2, 81, 9.1], tally: [87.9, 184.1, 12.1], fizz: [94.3, 132.4, 12.1], atlas: [93.4, 119.9, 11.1] },
  'grades-6-8': { pip: [93.8, 107.9, 8.5], lumi: [99.4, 91.8, 7.3], tally: [90.5, 160.9, 9.4], fizz: [95.1, 123.8, 10.2], atlas: [94.2, 117.6, 9.8] },
  'grades-9-12': { pip: [92.1, 97.5, 10.1], lumi: [99.4, 71.2, 9.1], tally: [87.8, 183.6, 12.1], fizz: [94.1, 129.1, 12.1], atlas: [93.3, 118.7, 11.1] }
};

// Inside color and tongue color for each guide (Pip's is the dark inside of his beak).
const COLORS = {
  pip: ['#D9531E', '#FF9AA8'], lumi: ['#E2574A', '#FF8F8F'], tally: ['#4A2FA0', '#FF9AB8'],
  fizz: ['#3D6B1C', '#FFA08A'], atlas: ['#5A3A22', '#FF9A8A']
};

// The two open shapes, drawn for a mouth 12 units wide with its top at y 0 (shown a third larger than the
// drawing's closed mouth, so the opening reads at the helper's small size). Closed is the drawing's own mouth.
function shapes(guide) {
  const [inside, tongue] = COLORS[guide] || COLORS.pip;
  return [
    ['g', { class: 'mouth mouth-1' },
      ['ellipse', { cx: 0, cy: 1.8, rx: 4.6, ry: 2.5, fill: inside }],
      ['ellipse', { cx: 0, cy: 3.1, rx: 2.3, ry: 0.9, fill: tongue }]],
    ['g', { class: 'mouth mouth-2' },
      ['path', { d: 'M-6.4 -0.4 Q 0 1.4 6.4 -0.4 Q 4.8 8.6 0 8.6 Q -4.8 8.6 -6.4 -0.4 Z', fill: inside }],
      ['ellipse', { cx: 0, cy: 6.4, rx: 3.1, ry: 1.6, fill: tongue }]]
  ];
}

// The overlay: an SVG the same size as the drawing, with both shapes at the mouth. Null when there is no spot.
export function mouthTree(guide, band) {
  const spot = MOUTH_SPOT[band] && MOUTH_SPOT[band][guide];
  if (!spot) return null;
  const [x, y, w] = spot;
  return ['svg', { viewBox: '0 0 200 240', class: 'mouth-layer', 'aria-hidden': 'true', focusable: 'false' },
    ['g', { transform: `translate(${x} ${y - 1.5}) rotate(${MOUTH_TILT}) scale(${(w / 9).toFixed(3)})` }, ...shapes(guide)]];
}
