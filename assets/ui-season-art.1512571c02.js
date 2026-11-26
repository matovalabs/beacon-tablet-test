// Seasonal and holiday art (logic spec section 17, "Seasons and holidays"), drawn in code in the character
// bible's flat style: flat fills, one lighter tone, navy ink for small details, no text, no figures.
// Three kinds of drawing, all plain element trees like scenes.js:
//   accessoryTree: one small thing a guide wears, in the guide's art units (200 by 240), placed on its head
//     or neck. scenes.js puts it inside the guide's rigged body, so it moves with the walk.
//   decorTree: two or three decorations for a home scene, in scene units (400 by 300).
//   markTree: a tiny mark for the island pill, on a 16 by 16 grid.
// Moving parts only carry class names (season-drift, season-float, season-flicker, twinkle); the motion is
// in styles.css under .stage.moving, transform and opacity only, and stops with movement off.

const INK = '#1E2F4D';
const CREAM = '#F5F1E6';

// Where things sit on each guide, per drawing band, in art units: x is the middle of the head,
// top the top of the head (or cap, or roof), band [y, width] where a hat or crown rests,
// eyes [y, half gap between the eyes], neck [y, width].
const FIT = {
  'grades-1-2': {
    pip: { x: 100, top: 40, band: [80, 124], eyes: [113, 23], neck: [158, 104] },
    lumi: { x: 100, top: 14, band: [55, 112], eyes: [87, 17], neck: [128, 92] },
    tally: { x: 90, top: 118, band: [126, 72], eyes: [137, 23], neck: [162, 104] },
    fizz: { x: 100, top: 50, band: [66, 100], eyes: [103, 20], neck: [133, 78] },
    atlas: { x: 100, top: 47, band: [62, 98], eyes: [93, 21], neck: [132, 74] }
  },
  'grades-3-5': {
    pip: { x: 100, top: 30, band: [66, 104], eyes: [91, 21], neck: [141, 84] },
    lumi: { x: 100, top: 8, band: [40, 96], eyes: [63, 14], neck: [97, 72] },
    tally: { x: 90, top: 112, band: [125, 70], eyes: [137, 22], neck: [160, 98] },
    fizz: { x: 100, top: 67, band: [80, 84], eyes: [110, 20], neck: [143, 72] },
    atlas: { x: 100, top: 63, band: [78, 84], eyes: [100, 20], neck: [135, 68] }
  },
  'grades-6-8': {
    pip: { x: 100, top: 37, band: [63, 70], eyes: [87, 18], neck: [116, 62] },
    lumi: { x: 100, top: 43, band: [63, 52], eyes: [91, 12], neck: [100, 50] },
    tally: { x: 93, top: 108, band: [113, 50], eyes: [123, 18], neck: [141, 80] },
    fizz: { x: 100, top: 73, band: [84, 62], eyes: [107, 17], neck: [125, 56] },
    atlas: { x: 100, top: 70, band: [82, 62], eyes: [107, 19], neck: [128, 56] }
  },
  'grades-9-12': {
    pip: { x: 100, top: 13, band: [47, 84], eyes: [73, 20], neck: [112, 80] },
    lumi: { x: 100, top: 17, band: [40, 64], eyes: [57, 14], neck: [84, 56] },
    tally: { x: 90, top: 98, band: [102, 66], eyes: [113, 20], neck: [148, 90] },
    fizz: { x: 100, top: 77, band: [92, 74], eyes: [110, 19], neck: [137, 70] },
    atlas: { x: 100, top: 73, band: [88, 74], eyes: [110, 19], neck: [134, 70] }
  }
};
export const FIT_GUIDES = ['pip', 'lumi', 'tally', 'fizz', 'atlas'];

const f1 = n => Number(n.toFixed(1));

// ---- Accessories -------------------------------------------------------------------------------------

function scarf(a, [c1, c2]) {
  const [y, w] = a.neck, x = a.x, l = x - w / 2;
  const stripes = [0.2, 0.45, 0.7].map(t => ['rect', { x: f1(l + w * t), y: y - 5, width: 5, height: 11, fill: c2 }]);
  return ['g', { class: 'acc acc-scarf' },
    ['rect', { x: f1(l), y: y - 5, width: w, height: 11, rx: 5.5, fill: c1 }],
    ...stripes,
    ['rect', { x: f1(l + 3), y: y - 4, width: f1(w - 6), height: 3, rx: 1.5, fill: '#FFFFFF', opacity: 0.25 }],
    ['path', { d: `M${f1(x + w * 0.18)} ${y + 3} l 10 0 l 3 22 l -10 2 Z`, fill: c1 }],
    ['path', { d: `M${f1(x + w * 0.18 + 1)} ${y + 20} l 10 -1.5 l 0.6 4 l -10 1.5 Z`, fill: c2 }]];
}

function knitHat(a, [c1, c2, pom]) {
  const [y, w] = a.band, x = a.x, hgt = w * 0.5;
  return ['g', { class: 'acc acc-hat' },
    ['path', { d: `M${f1(x - w / 2)} ${y} C ${f1(x - w / 2)} ${f1(y - hgt * 1.1)}, ${f1(x + w / 2)} ${f1(y - hgt * 1.1)}, ${f1(x + w / 2)} ${y} Z`, fill: c1 }],
    ['path', { d: `M${f1(x - w * 0.3)} ${f1(y - hgt * 0.55)} q ${f1(w * 0.15)} ${f1(-hgt * 0.25)} ${f1(w * 0.3)} 0`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0.3 }],
    ['rect', { x: f1(x - w / 2 - 2), y: y - 8, width: w + 4, height: 11, rx: 5.5, fill: c2 }],
    ['circle', { cx: x, cy: f1(y - hgt * 0.85), r: f1(Math.max(5, w * 0.09)), fill: pom }]];
}

function earmuffs(a, [c1, c2]) {
  const [y, w] = a.band, x = a.x, r = Math.max(7, w * 0.11);
  const side = y + 14;
  return ['g', { class: 'acc acc-muffs' },
    ['path', { d: `M${f1(x - w / 2 + 2)} ${side} C ${f1(x - w / 2)} ${f1(a.top - 14)}, ${f1(x + w / 2)} ${f1(a.top - 14)}, ${f1(x + w / 2 - 2)} ${side}`, fill: 'none', stroke: c2, 'stroke-width': 4, 'stroke-linecap': 'round' }],
    ...[-1, 1].flatMap(s => [
      ['circle', { cx: f1(x + s * (w / 2 - 2)), cy: side, r: f1(r), fill: c1 }],
      ['circle', { cx: f1(x + s * (w / 2 - 2) - r * 0.3), cy: f1(side - r * 0.3), r: f1(r * 0.4), fill: '#FFFFFF', opacity: 0.35 }]])];
}

function bloom(cx, cy, r, color) {
  return ['g', {}, ...[[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy]) => ['circle', { cx: f1(cx + dx * r), cy: f1(cy + dy * r), r: f1(r), fill: color }]),
    ['circle', { cx, cy, r: f1(r * 0.75), fill: '#FFF4C2' }]];
}

function flowerCrown(a, colors) {
  const [y, w] = a.band, x = a.x, n = 5;
  return ['g', { class: 'acc acc-crown' },
    ['path', { d: `M${f1(x - w / 2)} ${y} Q ${x} ${y - 9} ${f1(x + w / 2)} ${y}`, fill: 'none', stroke: '#3FA36A', 'stroke-width': 3, 'stroke-linecap': 'round' }],
    ...Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1), px = x - w / 2 + w * t, py = y - 9 * 4 * t * (1 - t) * 0.5 - 1;
      return bloom(f1(px), f1(py), Math.max(2.6, w * 0.035), colors[i % colors.length]);
    })];
}

function leafCrown(a, colors) {
  const [y, w] = a.band, x = a.x, n = 6;
  return ['g', { class: 'acc acc-crown' },
    ['path', { d: `M${f1(x - w / 2)} ${y} Q ${x} ${y - 9} ${f1(x + w / 2)} ${y}`, fill: 'none', stroke: '#8A5A3C', 'stroke-width': 2.5, 'stroke-linecap': 'round' }],
    ...Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1), px = f1(x - w / 2 + w * t), py = f1(y - 9 * 4 * t * (1 - t) * 0.5 - 2), s = Math.max(4, w * 0.06);
      return ['path', { d: `M${px} ${f1(py - s)} C ${f1(px + s)} ${f1(py - s * 0.4)}, ${f1(px + s * 0.6)} ${f1(py + s * 0.6)}, ${px} ${f1(py + s)} C ${f1(px - s * 0.6)} ${f1(py + s * 0.6)}, ${f1(px - s)} ${f1(py - s * 0.4)}, ${px} ${f1(py - s)} Z`, fill: colors[i % colors.length], transform: `rotate(${(t - 0.5) * 60} ${px} ${py})` }];
    })];
}

function sunHat(a, [c1, c2]) {
  const [y, w] = a.band, x = a.x;
  return ['g', { class: 'acc acc-sunhat' },
    ['ellipse', { cx: x, cy: y - 2, rx: f1(w * 0.78), ry: f1(Math.max(5, w * 0.09)), fill: c1 }],
    ['path', { d: `M${f1(x - w * 0.36)} ${y - 3} C ${f1(x - w * 0.36)} ${f1(y - w * 0.48)}, ${f1(x + w * 0.36)} ${f1(y - w * 0.48)}, ${f1(x + w * 0.36)} ${y - 3} Z`, fill: '#FBE8C4' }],
    ['rect', { x: f1(x - w * 0.36), y: f1(y - 10), width: f1(w * 0.72), height: 6, rx: 2, fill: c2 }],
    bloom(f1(x + w * 0.26), y - 8, 2.4, '#FF9AB8')];
}

function sunglasses(a) {
  const [y, gap] = a.eyes, x = a.x, r = Math.max(6, gap * 0.62);
  return ['g', { class: 'acc acc-glasses' },
    ['path', { d: `M${f1(x - gap + r * 0.6)} ${y - 2} Q ${x} ${y - 6} ${f1(x + gap - r * 0.6)} ${y - 2}`, fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-linecap': 'round' }],
    ...[-1, 1].flatMap(s => [
      ['rect', { x: f1(x + s * gap - r), y: f1(y - r * 0.8), width: f1(r * 2), height: f1(r * 1.6), rx: f1(r * 0.6), fill: INK }],
      ['path', { d: `M${f1(x + s * gap - r * 0.5)} ${f1(y - r * 0.3)} l ${f1(r * 0.5)} ${f1(-r * 0.3)}`, stroke: '#8BF0D0', 'stroke-width': 2, 'stroke-linecap': 'round' }]])];
}

function partyHat(a, [c1, c2]) {
  const x = a.x, base = a.top + 6, w = 26, hgt = 34;
  return ['g', { class: 'acc acc-party', transform: `rotate(-10 ${x} ${base})` },
    ['path', { d: `M${x - w / 2} ${base} L ${x} ${base - hgt} L ${x + w / 2} ${base} Z`, fill: c1 }],
    ['path', { d: `M${x - w * 0.34} ${f1(base - hgt * 0.3)} L ${x + w * 0.34} ${f1(base - hgt * 0.3)} L ${x + w * 0.27} ${f1(base - hgt * 0.45)} L ${x - w * 0.27} ${f1(base - hgt * 0.45)} Z`, fill: c2 }],
    ['path', { d: `M${x - w * 0.15} ${f1(base - hgt * 0.7)} L ${x + w * 0.15} ${f1(base - hgt * 0.7)} L ${x + w * 0.1} ${f1(base - hgt * 0.8)} L ${x - w * 0.1} ${f1(base - hgt * 0.8)} Z`, fill: c2 }],
    ['circle', { cx: x, cy: base - hgt, r: 4.5, fill: c2 }]];
}

function ears(a, [c1, c2], shape) {
  const [y, w] = a.band, x = a.x, dx = w * 0.26;
  const one = s => shape === 'bunny'
    ? [['ellipse', { cx: f1(x + s * dx), cy: f1(a.top - 14), rx: 7, ry: 17, fill: c1, transform: `rotate(${s * 10} ${f1(x + s * dx)} ${f1(a.top)})` }],
      ['ellipse', { cx: f1(x + s * dx), cy: f1(a.top - 13), rx: 3.5, ry: 12, fill: c2, transform: `rotate(${s * 10} ${f1(x + s * dx)} ${f1(a.top)})` }]]
    : [['path', { d: `M${f1(x + s * dx - 10)} ${a.top + 4} L ${f1(x + s * dx + s * 3)} ${a.top - 18} L ${f1(x + s * dx + 10)} ${a.top + 4} Z`, fill: c1 }],
      ['path', { d: `M${f1(x + s * dx - 5)} ${a.top + 1} L ${f1(x + s * dx + s * 2)} ${a.top - 10} L ${f1(x + s * dx + 5)} ${a.top + 1} Z`, fill: c2 }]];
  return ['g', { class: `acc acc-ears` },
    ...one(-1), ...one(1),
    ['path', { d: `M${f1(x - w / 2 + 4)} ${y} C ${f1(x - w / 2)} ${f1(a.top - 4)}, ${f1(x + w / 2)} ${f1(a.top - 4)}, ${f1(x + w / 2 - 4)} ${y}`, fill: 'none', stroke: c1, 'stroke-width': 4, 'stroke-linecap': 'round' }]];
}

function garland(a, colors) {
  const [y, w] = a.neck, x = a.x, n = 9;
  return ['g', { class: 'acc acc-garland' },
    ...Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1), px = x - w / 2 + w * t, py = y + 10 * 4 * t * (1 - t);
      return ['g', {}, ['circle', { cx: f1(px), cy: f1(py), r: 4.4, fill: colors[i % colors.length] }], ['circle', { cx: f1(px - 1.2), cy: f1(py - 1.2), r: 1.6, fill: '#FFF4C2' }]];
    })];
}

function heartPath(cx, cy, s) {
  return `M${f1(cx)} ${f1(cy + s * 0.9)} C ${f1(cx - s * 1.4)} ${f1(cy)}, ${f1(cx - s * 0.9)} ${f1(cy - s * 1.1)}, ${f1(cx)} ${f1(cy - s * 0.4)} C ${f1(cx + s * 0.9)} ${f1(cy - s * 1.1)}, ${f1(cx + s * 1.4)} ${f1(cy)}, ${f1(cx)} ${f1(cy + s * 0.9)} Z`;
}
function starPath(cx, cy, r) {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = (i * 36 - 90) * Math.PI / 180, rr = i % 2 ? r * 0.45 : r; return `${f1(cx + rr * Math.cos(a))},${f1(cy + rr * Math.sin(a))}`; });
  return pts.join(' ');
}

function pin(a, shape, [c1, c2]) {
  const [y, w] = a.neck, cx = f1(a.x + w * 0.22), cy = y + 14;
  return ['g', { class: 'acc acc-pin' },
    ['circle', { cx, cy, r: 9, fill: c2 }],
    shape === 'heart' ? ['path', { d: heartPath(cx, cy, 5.5), fill: c1 }] : ['polygon', { points: starPath(cx, cy, 6.5), fill: c1 }]];
}

function bowtie(a, [c1, c2]) {
  const [y] = a.neck, x = a.x;
  return ['g', { class: 'acc acc-bow' },
    ['path', { d: `M${x} ${y} L ${x - 13} ${y - 8} L ${x - 13} ${y + 8} Z M${x} ${y} L ${x + 13} ${y - 8} L ${x + 13} ${y + 8} Z`, fill: c1 }],
    ['path', { d: `M${x - 10} ${y - 3} L ${x - 4} ${y} L ${x - 10} ${y + 3} Z M${x + 10} ${y - 3} L ${x + 4} ${y} L ${x + 10} ${y + 3} Z`, fill: '#FFFFFF', opacity: 0.35 }],
    ['rect', { x: x - 4, y: y - 4.5, width: 8, height: 9, rx: 3, fill: c2 }]];
}

// The look's accessory, by kind. Pip wears a captain's cap and Lumi a lantern roof, so a hat would sit badly:
// they get earmuffs instead of a knit hat and sunglasses instead of a sun hat.
const WEAR = {
  autumn: { kind: 'scarf', colors: ['#E9672A', '#FFC75A'] },
  winter: { kind: 'knithat', colors: ['#5B7FB0', '#B9C3D8', CREAM] },
  spring: { kind: 'flowers', colors: ['#FF9AB8', '#FFD36E', CREAM] },
  summer: { kind: 'sunhat', colors: ['#F4D9A8', '#FE6B5B'] },
  'new-year': { kind: 'party', colors: ['#E9A62A', INK] },
  'lunar-new-year': { kind: 'scarf', colors: ['#D9453A', '#E9A62A'] },
  valentines: { kind: 'pin-heart', colors: ['#FE6B5B', CREAM] },
  'eid-al-fitr': { kind: 'scarf', colors: ['#2FA38F', '#E9A62A'] },
  easter: { kind: 'bunny', colors: [CREAM, '#FF9AB8'] },
  juneteenth: { kind: 'pin-star', colors: ['#D9453A', '#FFD36E'] },
  'july-4': { kind: 'bowtie', colors: ['#D9453A', '#3E6FD8'] },
  diwali: { kind: 'garland', colors: ['#F28C28', '#FFC233'] },
  halloween: { kind: 'cat', colors: [INK, '#E9672A'] },
  thanksgiving: { kind: 'leaves', colors: ['#E9672A', '#C4841A', '#B04A3A'] },
  hanukkah: { kind: 'scarf', colors: ['#3E6FD8', CREAM] },
  christmas: { kind: 'knithat', colors: ['#D9453A', CREAM, CREAM] },
  kwanzaa: { kind: 'scarf', colors: ['#2E8B57', '#D9453A'] }
};
export const LOOK_IDS = Object.keys(WEAR);

export function accessoryKind(lookId, guide) {
  const w = WEAR[lookId];
  if (!w) return null;
  const capped = guide === 'pip' || guide === 'lumi';
  if (capped && w.kind === 'knithat') return 'muffs';
  if (capped && w.kind === 'sunhat') return 'glasses';
  return w.kind;
}

export function accessoryTree(lookId, guide, band) {
  const a = (FIT[band] || FIT['grades-3-5'])[guide];
  const w = WEAR[lookId];
  if (!a || !w) return null;
  const c = w.colors;
  const draw = {
    scarf: () => scarf(a, c), knithat: () => knitHat(a, c), muffs: () => earmuffs(a, c), flowers: () => flowerCrown(a, c),
    sunhat: () => sunHat(a, c), glasses: () => sunglasses(a), party: () => partyHat(a, c), bunny: () => ears(a, c, 'bunny'),
    cat: () => ears(a, c, 'cat'), leaves: () => leafCrown(a, c), garland: () => garland(a, c), 'pin-heart': () => pin(a, 'heart', c),
    'pin-star': () => pin(a, 'star', c), bowtie: () => bowtie(a, c)
  }[accessoryKind(lookId, guide)];
  return ['g', { class: `accessory look-${lookId}`, 'data-look': lookId }, draw()];
}

// ---- Scene decorations -------------------------------------------------------------------------------

// Per scene: two clear spots on the ground (left and right, x and the ground y there), the height of a
// hanging string (it stays below y = 105, since a wide stage crops the top), and whether it is daytime.
const SPOTS = {
  harbor: { left: [26, 214], right: [384, 214], hang: 118, day: false, ground: 'M0 214 H 400 V 219 H 0 Z' },
  cliff: { left: [56, 244], right: [352, 252], hang: 112, day: true, ground: 'M0 200 Q 120 150 260 175 Q 330 188 400 230 L 400 236 Q 330 194 260 181 Q 120 157 0 206 Z' },
  tidepool: { left: [30, 214], right: [376, 224], hang: 112, day: false, ground: 'M0 175 Q 200 150 400 178 L 400 184 Q 200 157 0 181 Z' },
  reef: { left: [118, 246], right: [372, 244], hang: 112, day: true, ground: 'M0 240 Q 100 222 200 236 T 400 232 L 400 237 Q 300 240 200 241 T 0 245 Z' },
  riverbank: { left: [26, 214], right: [384, 204], hang: 112, day: true, ground: 'M0 175 H 400 V 181 H 0 Z' }
};

// Things that stand on the ground are drawn a little larger, grown from their own ground spot.
const G = (p, ...n) => ['g', { transform: `translate(${p[0]} ${p[1]}) scale(1.4) translate(${-p[0]} ${-p[1]})` }, ...n];
const drift = (list, draw) => list.map(([x, y], i) => ['g', { class: `season-drift d${i % 4}` }, draw(x, y, i)]);
const SKYDOTS = [[30, 118], [92, 132], [150, 112], [214, 128], [262, 116], [318, 136], [372, 120], [124, 150], [348, 158], [60, 160]];

function leafShape(x, y, color, rot) {
  return ['path', { d: `M${x} ${y - 5} C ${x + 5} ${y - 2}, ${x + 3} ${y + 3}, ${x} ${y + 5} C ${x - 3} ${y + 3}, ${x - 5} ${y - 2}, ${x} ${y - 5} Z`, fill: color, transform: `rotate(${rot} ${x} ${y})` }];
}
function pumpkin(x, y, s = 1) {
  return ['g', { class: 'decor-pumpkin', transform: `translate(${x} ${y}) scale(${s})` },
    ['ellipse', { cx: -7, cy: -10, rx: 9, ry: 10, fill: '#E9672A' }], ['ellipse', { cx: 7, cy: -10, rx: 9, ry: 10, fill: '#E9672A' }],
    ['ellipse', { cx: 0, cy: -10, rx: 8, ry: 10.5, fill: '#F28C28' }],
    ['path', { d: 'M-1 -20 q 1 -5 4 -6', stroke: '#2F6647', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }],
    ['path', { d: 'M3 -21 q 6 -3 8 1 q -5 2 -8 -1 Z', fill: '#3FA36A' }]];
}
function lightString(hang, colors, cls = 'season-flicker') {
  const p0 = [0, hang], c = [200, hang + 26], p1 = [400, hang];
  const along = t => [0, 1].map(i => (1 - t) ** 2 * p0[i] + 2 * t * (1 - t) * c[i] + t ** 2 * p1[i]);
  return ['g', { class: 'decor-lights' },
    ['path', { d: `M${p0} Q ${c} ${p1}`, fill: 'none', stroke: INK, 'stroke-width': 1.5, opacity: 0.8 }],
    ...Array.from({ length: 13 }, (_, i) => {
      const [x, y] = along((i + 0.5) / 13);
      return ['g', {}, ['rect', { x: f1(x - 1.5), y: f1(y - 1), width: 3, height: 3, fill: INK }],
        ['ellipse', { cx: f1(x), cy: f1(y + 6), rx: 3, ry: 4.5, fill: colors[i % colors.length], class: `${cls} f${i % 3}` }]];
    })];
}
function lantern(x, y, c1, c2) {
  return ['g', { transform: `translate(${x} ${y})` }, ['g', { class: 'season-float' },
    ['path', { d: 'M0 -14 V -4', stroke: INK, 'stroke-width': 1.2 }],
    ['rect', { x: -6, y: -5, width: 12, height: 3, rx: 1, fill: c2 }],
    ['ellipse', { cx: 0, cy: 6, rx: 10, ry: 10, fill: c1 }],
    ['ellipse', { cx: -3, cy: 4, rx: 3, ry: 6, fill: '#FFFFFF', opacity: 0.22 }],
    ['rect', { x: -6, y: 14, width: 12, height: 3, rx: 1, fill: c2 }],
    ['path', { d: 'M-3 17 V 24 M0 17 V 26 M3 17 V 24', stroke: c2, 'stroke-width': 1.2 }]]];
}
function bunting(hang, colors) {
  const p0 = [0, hang], c = [200, hang + 22], p1 = [400, hang];
  const along = t => [0, 1].map(i => (1 - t) ** 2 * p0[i] + 2 * t * (1 - t) * c[i] + t ** 2 * p1[i]);
  return ['g', { class: 'decor-bunting' },
    ['path', { d: `M${p0} Q ${c} ${p1}`, fill: 'none', stroke: CREAM, 'stroke-width': 1.5 }],
    ...Array.from({ length: 12 }, (_, i) => { const [x, y] = along((i + 0.5) / 12); return ['path', { d: `M${f1(x - 6)} ${f1(y)} h 12 l -6 12 Z`, fill: colors[i % colors.length], class: 'flag' }]; })];
}
function burst(x, y, r, color, i) {
  return ['g', { class: `twinkle t${i % 3}`, transform: `translate(${x} ${y})` },
    ...Array.from({ length: 10 }, (_, k) => { const a = k * 36 * Math.PI / 180; return ['path', { d: `M${f1(Math.cos(a) * r * 0.35)} ${f1(Math.sin(a) * r * 0.35)} L ${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`, stroke: color, 'stroke-width': 2.4, 'stroke-linecap': 'round' }]; }),
    ['circle', { r: 2.5, fill: '#FFF4C2' }]];
}
function egg(x, y, c1, c2, rot) {
  return ['g', { transform: `rotate(${rot} ${x} ${y})` },
    ['ellipse', { cx: x, cy: y - 8, rx: 6.5, ry: 8.5, fill: c1 }],
    ['path', { d: `M${x - 6.3} ${y - 9} q 3.2 -3 6.3 0 t 6.3 0`, fill: 'none', stroke: c2, 'stroke-width': 2 }]];
}
function grassTuft(x, y) {
  return ['path', { d: `M${x - 12} ${y} q 2 -8 4 0 q 2 -10 4 0 q 2 -8 4 0 q 2 -10 4 0 q 2 -8 4 0 q 2 -9 4 0 Z`, fill: '#57A06F' }];
}
function diya(x, y, i) {
  return ['g', { transform: `translate(${x} ${y})` },
    ['path', { d: 'M-9 -5 Q 0 4 9 -5 Z', fill: '#C4641A' }], ['path', { d: 'M-9 -5 H 9', stroke: '#E9A62A', 'stroke-width': 1.6 }],
    ['path', { d: 'M0 -15 C 3 -11, 3 -8, 0 -6 C -3 -8, -3 -11, 0 -15 Z', fill: '#FFC233', class: `season-flicker f${i % 3}` }]];
}
function gift(x, y, w, c1, c2) {
  return ['g', {}, ['rect', { x: x - w / 2, y: y - w, width: w, height: w, rx: 2, fill: c1 }],
    ['rect', { x: x - 2, y: y - w, width: 4, height: w, fill: c2 }],
    ['path', { d: `M${x} ${y - w} q -7 -7 -9 -1 q 3 3 9 1 q 7 -7 9 -1 q -3 3 -9 1`, fill: c2 }]];
}
function wreath(x, y) {
  const leaves = Array.from({ length: 14 }, (_, k) => { const a = k * (360 / 14) * Math.PI / 180; return ['circle', { cx: f1(x + 13 * Math.cos(a)), cy: f1(y + 13 * Math.sin(a)), r: 6, fill: k % 2 ? '#2E8B57' : '#3FA36A' }]; });
  return ['g', { class: 'decor-wreath' }, ['path', { d: `M${x} ${y - 34} V ${y - 19}`, stroke: INK, 'stroke-width': 1.2 }], ...leaves,
    ...[[0, -13], [11, 7], [-11, 7]].map(([dx, dy]) => ['circle', { cx: x + dx, cy: y + dy, r: 2.6, fill: '#D9453A' }]),
    ['path', { d: `M${x} ${y + 12} l -7 -5 v 10 Z M${x} ${y + 12} l 7 -5 v 10 Z`, fill: '#D9453A' }]];
}
function sun(x, y) {
  return ['g', { class: 'decor-sun' },
    ['g', { class: 'season-spin', transform: `translate(${x} ${y})` },
      ...Array.from({ length: 12 }, (_, k) => { const a = k * 30 * Math.PI / 180; return ['path', { d: `M${f1(Math.cos(a) * 20)} ${f1(Math.sin(a) * 20)} L ${f1(Math.cos(a) * 27)} ${f1(Math.sin(a) * 27)}`, stroke: '#FFC233', 'stroke-width': 3, 'stroke-linecap': 'round' }]; })],
    ['circle', { cx: x, cy: y, r: 16, fill: '#FFD36E' }], ['circle', { cx: x - 4, cy: y - 4, r: 6, fill: '#FFE9A6' }]];
}
function sunflower(x, y, hgt) {
  return ['g', {}, ['path', { d: `M${x} ${y} V ${y - hgt}`, stroke: '#2F6647', 'stroke-width': 3, 'stroke-linecap': 'round' }],
    ['path', { d: `M${x} ${y - hgt * 0.45} q 8 -6 12 0 q -6 5 -12 0 Z`, fill: '#3FA36A' }],
    ...Array.from({ length: 10 }, (_, k) => { const a = k * 36; return ['ellipse', { cx: x, cy: y - hgt - 7, rx: 3, ry: 6.5, fill: '#FFC233', transform: `rotate(${a} ${x} ${y - hgt})` }]; }),
    ['circle', { cx: x, cy: y - hgt, r: 5, fill: '#8A5A3C' }]];
}
function fruitBasket(x, y) {
  return ['g', {}, ...[[-8, '#D9453A'], [0, '#FFC233'], [8, '#2E8B57'], [-4, '#F28C28'], [4, '#D9453A']].map(([dx, c], i) => ['circle', { cx: x + dx, cy: y - (i < 3 ? 12 : 18), r: 5.5, fill: c }]),
    ['path', { d: `M${x - 15} ${y - 12} H ${x + 15} L ${x + 11} ${y} H ${x - 11} Z`, fill: '#C4841A' }],
    ['path', { d: `M${x - 13} ${y - 7} H ${x + 13}`, stroke: '#8A5A3C', 'stroke-width': 1.5 }]];
}
function coins(x, y) {
  return ['g', {}, ...[[-7, 0], [6, 0], [0, -4], [-1, -9]].map(([dx, dy]) => ['g', {}, ['ellipse', { cx: x + dx, cy: y + dy - 3, rx: 7, ry: 3.5, fill: '#C4841A' }], ['ellipse', { cx: x + dx, cy: y + dy - 4, rx: 7, ry: 3.2, fill: '#FFC233' }]])];
}
function spinningTop(x, y, c1, c2) {
  return ['g', { transform: `rotate(-12 ${x} ${y})` },
    ['rect', { x: x - 1.5, y: y - 30, width: 3, height: 8, fill: INK }],
    ['path', { d: `M${x - 10} ${y - 22} H ${x + 10} V ${y - 10} L ${x} ${y} L ${x - 10} ${y - 10} Z`, fill: c1 }],
    ['path', { d: `M${x - 10} ${y - 22} H ${x} V ${y} L ${x - 10} ${y - 10} Z`, fill: c2, opacity: 0.35 }]];
}
function snowdrift(path) { return ['path', { d: path, fill: '#FFFFFF', opacity: 0.92 }]; }

const DECOR = {
  autumn: s => [
    G(s.left, ['g', { class: 'decor-leafpile' }, ...[[-10, 0, '#E9672A', 20], [0, -4, '#C4841A', -30], [10, 0, '#B04A3A', 60], [4, 2, '#FFC75A', 10], [-4, 2, '#E9672A', -60]].map(([dx, dy, c, r]) => leafShape(s.left[0] + dx + 8, s.left[1] + dy - 3, c, r))]),
    ...drift(SKYDOTS.slice(0, 6), (x, y, i) => leafShape(x, y, ['#E9672A', '#FFC75A', '#B04A3A'][i % 3], i * 50))
  ],
  winter: s => [
    snowdrift(s.ground),
    G(s.right, ['g', { class: 'decor-snowman', transform: `translate(${s.right[0]} ${s.right[1]})` },
      ['circle', { cx: 0, cy: -9, r: 10, fill: '#FFFFFF' }], ['circle', { cx: 0, cy: -24, r: 7, fill: '#FFFFFF' }],
      ['circle', { cx: -2.5, cy: -26, r: 1.2, fill: INK }], ['circle', { cx: 2.5, cy: -26, r: 1.2, fill: INK }],
      ['path', { d: 'M0 -23.5 l 6 1.5 l -6 1 Z', fill: '#F28C28' }], ['rect', { x: -8, y: -19, width: 16, height: 3, rx: 1.5, fill: '#5B7FB0' }]]),
    ...drift(SKYDOTS, (x, y) => ['circle', { cx: x, cy: y, r: 2.4, fill: '#FFFFFF', opacity: 0.9 }])
  ],
  spring: s => [
    G(s.left, ['g', { class: 'decor-flowers' }, grassTuft(s.left[0] + 8, s.left[1]), ...[[0, '#FF9AB8'], [12, '#FFD36E'], [22, CREAM]].map(([dx, c]) => ['g', {}, ['path', { d: `M${s.left[0] + dx} ${s.left[1]} v -10`, stroke: '#2F6647', 'stroke-width': 2 }], bloom(s.left[0] + dx, s.left[1] - 12, 3, c)])]),
    ['g', { transform: `translate(${s.right[0] - 20} ${s.hang + 30})` }, ['g', { class: 'season-float' },
      ['ellipse', { cx: -5, cy: 0, rx: 6, ry: 8, fill: '#FF9AB8', transform: 'rotate(-20)' }], ['ellipse', { cx: 5, cy: 0, rx: 6, ry: 8, fill: '#FFD36E', transform: 'rotate(20)' }],
      ['rect', { x: -1, y: -7, width: 2, height: 14, rx: 1, fill: INK }]]],
    ...drift(SKYDOTS.slice(1, 8), (x, y) => ['ellipse', { cx: x, cy: y, rx: 2.6, ry: 1.8, fill: '#FFC9D6' }])
  ],
  summer: s => [
    s.day ? sun(330, 128) : ['g', {}, ...SKYDOTS.slice(0, 6).map(([x, y], i) => ['circle', { cx: x, cy: y + 20, r: 1.8, fill: '#FFF07A', class: `twinkle t${i % 3}` }])],
    G(s.left, ['g', { class: 'decor-sunflowers' }, sunflower(s.left[0], s.left[1], 30), sunflower(s.left[0] + 16, s.left[1], 22)]),
    G(s.right, ['g', { transform: `translate(${s.right[0]} ${s.right[1] - 9})` }, ['circle', { r: 9, fill: CREAM }], ['path', { d: 'M0 -9 A 9 9 0 0 1 9 0 L 0 0 Z', fill: '#FE6B5B' }], ['path', { d: 'M0 9 A 9 9 0 0 1 -9 0 L 0 0 Z', fill: '#3E6FD8' }]])
  ],
  'new-year': s => [
    ...[[60, 128, '#FFD36E'], [330, 120, '#FF9AB8'], [200, 112, '#8BF0D0']].map(([x, y, c], i) => burst(x, y, 16, c, i)),
    ...drift(SKYDOTS, (x, y, i) => ['rect', { x, y, width: 4, height: 2.5, fill: ['#FFD36E', '#FE6B5B', '#8BF0D0', '#B9A8F0'][i % 4], transform: `rotate(${i * 37} ${x} ${y})` }])
  ],
  'lunar-new-year': s => [lightString(s.hang, ['#FFD36E']), ...[70, 200, 330].map(x => lantern(x, s.hang + (x === 200 ? 34 : 24), '#D9453A', '#E9A62A'))],
  valentines: s => [bunting(s.hang, ['#FF9AB8', '#FE6B5B', CREAM]), ...drift(SKYDOTS.slice(0, 7), (x, y, i) => ['path', { d: heartPath(x, y + 10, 4 + (i % 2) * 2), fill: i % 2 ? '#FE6B5B' : '#FF9AB8' }])],
  'eid-al-fitr': s => [lightString(s.hang, ['#FFD36E', '#8BF0D0']), lantern(90, s.hang + 28, '#E9A62A', '#2FA38F'), lantern(310, s.hang + 28, '#2FA38F', '#E9A62A'),
    ...[[40, 108], [160, 104], [250, 108], [370, 104]].map(([x, y], i) => ['polygon', { points: starPath(x, y, 4), fill: '#FFE9A6', class: `twinkle t${i % 3}` }])],
  easter: s => [
    G(s.left, ['g', { class: 'decor-eggs' }, grassTuft(s.left[0] + 10, s.left[1]), egg(s.left[0], s.left[1], '#FF9AB8', CREAM, -10), egg(s.left[0] + 14, s.left[1], '#8BF0D0', '#FFD36E', 8), egg(s.left[0] + 26, s.left[1], '#FFD36E', '#B9A8F0', -4)]),
    G(s.right, ['g', { class: 'decor-eggs' }, grassTuft(s.right[0] - 4, s.right[1]), egg(s.right[0] - 8, s.right[1], '#B9A8F0', CREAM, 6), egg(s.right[0] + 4, s.right[1], '#FF9AB8', '#8BF0D0', -8)]),
    ...drift(SKYDOTS.slice(2, 8), (x, y) => ['ellipse', { cx: x, cy: y, rx: 2.6, ry: 1.8, fill: '#FFC9D6' }])
  ],
  juneteenth: s => [bunting(s.hang, ['#D9453A', '#FFD36E', '#2E8B57']), ...[[60, 140], [330, 132]].map(([x, y], i) => burst(x, y, 14, i ? '#FFD36E' : '#FE6B5B', i)),
    ...[[130, 150], [270, 156]].map(([x, y], i) => ['polygon', { points: starPath(x, y, 5), fill: '#FFE9A6', class: `twinkle t${i % 3}` }])],
  'july-4': s => [bunting(s.hang, ['#D9453A', CREAM, '#3E6FD8']), ...[[70, 140, '#FE6B5B'], [200, 150, CREAM], [330, 138, '#7FB2FF']].map(([x, y, c], i) => burst(x, y, 17, c, i))],
  diwali: s => [lightString(s.hang, ['#FFC233', '#F28C28', '#FFE9A6']), G(s.left, ['g', { class: 'decor-diyas' }, ...[0, 18, 36].map((dx, i) => diya(s.left[0] + dx, s.left[1], i))]),
    G(s.right, ['g', { class: 'decor-diyas' }, ...[-18, 0].map((dx, i) => diya(s.right[0] + dx, s.right[1], i + 1))])],
  halloween: s => [lightString(s.hang, ['#F28C28', '#B9A8F0']), G(s.left, pumpkin(s.left[0] + 10, s.left[1])), G(s.right, pumpkin(s.right[0] - 6, s.right[1], 0.75))],
  thanksgiving: s => [G(s.left, ['g', { class: 'decor-harvest' }, pumpkin(s.left[0] + 8, s.left[1], 0.8), fruitBasket(s.left[0] + 30, s.left[1])]),
    ...drift(SKYDOTS.slice(0, 6), (x, y, i) => leafShape(x, y, ['#E9672A', '#C4841A', '#B04A3A'][i % 3], i * 50))],
  hanukkah: s => [lightString(s.hang, ['#7FB2FF', CREAM, '#3E6FD8']), G(s.left, ['g', { class: 'decor-coins' }, coins(s.left[0] + 8, s.left[1]), spinningTop(s.left[0] + 30, s.left[1], '#3E6FD8', CREAM)]),
    G(s.right, spinningTop(s.right[0], s.right[1], '#E9A62A', CREAM))],
  christmas: s => [lightString(s.hang, ['#D9453A', '#FFD36E', '#3FA36A', '#7FB2FF']), wreath(330, s.hang + 50),
    G(s.left, ['g', { class: 'decor-gifts' }, gift(s.left[0], s.left[1], 16, '#D9453A', '#FFD36E'), gift(s.left[0] + 18, s.left[1], 12, '#3FA36A', CREAM)])],
  kwanzaa: s => [bunting(s.hang, ['#D9453A', INK, '#2E8B57']), G(s.left, fruitBasket(s.left[0] + 12, s.left[1])), G(s.right, ['g', {}, ...[[0, '#D9453A'], [8, '#2E8B57']].map(([dx, c]) => ['circle', { cx: s.right[0] + dx - 4, cy: s.right[1] - 6, r: 6, fill: c }])])]
};

export function decorTree(lookId, sceneName) {
  const s = SPOTS[sceneName] || SPOTS.harbor;
  const make = DECOR[lookId];
  return make ? ['g', { class: `season-decor look-${lookId}`, 'data-look': lookId }, ...make(s)] : null;
}

// ---- Island marks (16 by 16) ---------------------------------------------------------------------------

const MARK = {
  autumn: () => [leafShape(8, 8, '#E9672A', 30)].map(l => ['g', { transform: 'translate(8 8) scale(1.3) translate(-8 -8)' }, l]),
  winter: () => [['g', {}, ...[0, 60, 120].map(a => ['path', { d: 'M8 2 V 14', stroke: '#CFE6FF', 'stroke-width': 1.8, 'stroke-linecap': 'round', transform: `rotate(${a} 8 8)` }])]],
  spring: () => [bloom(8, 8, 3, '#FF9AB8')],
  summer: () => [['circle', { cx: 8, cy: 8, r: 4.2, fill: '#FFD36E' }], ...Array.from({ length: 8 }, (_, k) => { const a = k * 45 * Math.PI / 180; return ['path', { d: `M${f1(8 + Math.cos(a) * 5.6)} ${f1(8 + Math.sin(a) * 5.6)} L ${f1(8 + Math.cos(a) * 7.4)} ${f1(8 + Math.sin(a) * 7.4)}`, stroke: '#FFC233', 'stroke-width': 1.4, 'stroke-linecap': 'round' }]; })],
  'new-year': () => [['polygon', { points: starPath(8, 8, 7), fill: '#FFD36E' }]],
  'lunar-new-year': () => [['ellipse', { cx: 8, cy: 8.5, rx: 5.5, ry: 5, fill: '#D9453A' }], ['rect', { x: 5, y: 2.2, width: 6, height: 2, rx: 0.8, fill: '#E9A62A' }], ['rect', { x: 5, y: 12.8, width: 6, height: 2, rx: 0.8, fill: '#E9A62A' }]],
  valentines: () => [['path', { d: heartPath(8, 8.3, 5), fill: '#FE6B5B' }]],
  'eid-al-fitr': () => [['ellipse', { cx: 8, cy: 9, rx: 4.5, ry: 5, fill: '#E9A62A' }], ['ellipse', { cx: 8, cy: 9, rx: 2, ry: 2.6, fill: '#FFF4C2' }], ['path', { d: 'M5.5 3.6 H 10.5 L 8 1.5 Z', fill: '#2FA38F' }]],
  easter: () => [['ellipse', { cx: 8, cy: 8.5, rx: 4.8, ry: 6.2, fill: '#FF9AB8' }], ['path', { d: 'M3.4 8 q 2.3 -2 4.6 0 t 4.6 0', stroke: CREAM, 'stroke-width': 1.4, fill: 'none' }]],
  juneteenth: () => [['polygon', { points: starPath(8, 8, 7), fill: '#FE6B5B' }]],
  'july-4': () => [burst(8, 8, 7, '#7FB2FF', 0)],
  diwali: () => [diya(8, 13, 0)],
  halloween: () => [pumpkin(8, 15, 0.62)],
  thanksgiving: () => [['g', { transform: 'translate(8 8) scale(1.3) translate(-8 -8)' }, leafShape(8, 8, '#C4841A', -20)]],
  hanukkah: () => [['polygon', { points: '8,1.5 9.6,6.4 14.5,8 9.6,9.6 8,14.5 6.4,9.6 1.5,8 6.4,6.4', fill: '#7FB2FF' }]],
  christmas: () => [['circle', { cx: 8, cy: 8, r: 5.4, fill: 'none', stroke: '#3FA36A', 'stroke-width': 3 }], ['circle', { cx: 8, cy: 13.2, r: 1.6, fill: '#D9453A' }]],
  kwanzaa: () => [['circle', { cx: 3.5, cy: 8, r: 2.6, fill: '#D9453A' }], ['circle', { cx: 8, cy: 8, r: 2.6, fill: CREAM }], ['circle', { cx: 12.5, cy: 8, r: 2.6, fill: '#2E8B57' }]]
};

export function markTree(lookId, cls = 'island-mark') {
  const make = MARK[lookId];
  return make ? ['svg', { viewBox: '0 0 16 16', class: `${cls} look-${lookId}`, 'aria-hidden': 'true', focusable: 'false' }, ...make()] : null;
}
