// Home scenes for the guides, drawn in the character bible's style: flat fills with one lighter tone,
// rounded shapes, navy ink, a soft ground shadow. Each scene is plain data (tag, attributes, children)
// so the page can build it with the DOM and tools/render-stage.mjs can write the same picture as an SVG file.
// Animated parts only carry class names; the motion lives in styles.css and stops for reduced motion.

const W = 400, H = 300;

function stars(list) {
  return list.map(([x, y, r], i) => ['circle', { cx: x, cy: y, r, fill: '#FFE9A6', class: `twinkle t${i % 3}` }]);
}

function waves(y, color, light) {
  return ['g', { class: 'waves' },
    ['path', { d: `M0 ${y} Q 25 ${y - 6} 50 ${y} T 100 ${y} T 150 ${y} T 200 ${y} T 250 ${y} T 300 ${y} T 350 ${y} T 400 ${y} T 450 ${y} V ${H} H 0 Z`, fill: color }],
    ['path', { d: `M0 ${y + 14} Q 25 ${y + 9} 50 ${y + 14} T 100 ${y + 14} T 150 ${y + 14} T 200 ${y + 14} T 250 ${y + 14} T 300 ${y + 14} T 350 ${y + 14} T 400 ${y + 14} T 450 ${y + 14}`, fill: 'none', stroke: light, 'stroke-width': 3, 'stroke-linecap': 'round', class: 'wave-line' }]];
}

function sky(id, top, bottom) {
  return [
    ['defs', {}, ['linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, ['stop', { offset: 0, 'stop-color': top }], ['stop', { offset: 1, 'stop-color': bottom }]]],
    ['rect', { x: 0, y: 0, width: W, height: H, fill: `url(#${id})` }]
  ];
}

const SCENES = {
  // Pip, reading: a night harbor with a lookout dock and a pile of books.
  harbor: () => ['g', {},
    ...sky('sky-harbor', '#0F1B33', '#22386A'),
    ...stars([[40, 30, 1.6], [90, 55, 1.2], [150, 25, 1.8], [230, 45, 1.2], [300, 20, 1.6], [360, 60, 1.2], [200, 75, 1]]),
    ['path', { d: 'M330 60 a22 22 0 1 0 14 38 a18 18 0 1 1 -14 -38 Z', fill: '#F5F1E6' }],
    ['g', { transform: 'translate(52 112)' },
      ['rect', { x: 0, y: 10, width: 12, height: 50, fill: '#F4F1EA' }],
      ['rect', { x: 0, y: 22, width: 12, height: 8, fill: '#FE6B5B' }], ['rect', { x: 0, y: 40, width: 12, height: 8, fill: '#FE6B5B' }],
      ['rect', { x: -2, y: 4, width: 16, height: 8, rx: 2, fill: '#1E2F4D' }], ['circle', { cx: 6, cy: 4, r: 4, fill: '#FFD36E', class: 'glow' }]],
    waves(170, '#1A4A6E', '#2E6A93'),
    ['rect', { x: 0, y: 214, width: W, height: 18, rx: 4, fill: '#8A5A3C' }],
    ['rect', { x: 0, y: 214, width: W, height: 5, fill: '#A9734E' }],
    ...[30, 130, 230, 330].map(x => ['rect', { x, y: 228, width: 14, height: 72, rx: 3, fill: '#6E4630' }]),
    ['g', { transform: 'translate(318 182)' },
      ['rect', { x: 0, y: 22, width: 44, height: 10, rx: 2, fill: '#E9A62A' }],
      ['rect', { x: 4, y: 12, width: 38, height: 10, rx: 2, fill: '#8BF0D0' }],
      ['rect', { x: 2, y: 2, width: 40, height: 10, rx: 2, fill: '#FE6B5B' }]]
  ],
  // Lumi, progress: a grassy cliff at dusk over the sea. Her beam is drawn with her (stage.js), from her lamp.
  cliff: () => ['g', {},
    ...sky('sky-cliff', '#1B2B52', '#E8A877'),
    ...stars([[50, 28, 1.4], [120, 18, 1.2], [260, 30, 1.6], [350, 22, 1.2]]),
    waves(190, '#2B4F7A', '#4A6A9E'),
    ['path', { d: 'M0 200 Q 120 150 260 175 Q 330 188 400 230 V 300 H 0 Z', fill: '#3E7D5A' }],
    ['path', { d: 'M0 200 Q 120 150 260 175 Q 330 188 400 230 L 400 240 Q 330 198 260 186 Q 120 162 0 212 Z', fill: '#57A06F' }],
    ...[[60, 214], [110, 200], [170, 196]].map(([x, y]) => ['path', { d: `M${x} ${y} l4 -10 l4 10 Z`, fill: '#2F6647' }])
  ],
  // Tally, math: a sunset beach with tide pools and shells set out in counting rows.
  tidepool: () => ['g', {},
    ...sky('sky-tide', '#FFC9B5', '#FFE3D6'),
    ['circle', { cx: 320, cy: 70, r: 26, fill: '#FFD36E', class: 'glow' }],
    waves(150, '#7FC8D9', '#B5E3EC'),
    ['path', { d: 'M0 175 Q 200 150 400 178 V 300 H 0 Z', fill: '#F4D9A8' }],
    ['path', { d: 'M0 175 Q 200 150 400 178 L 400 186 Q 200 160 0 184 Z', fill: '#FBE8C4' }],
    ['ellipse', { cx: 80, cy: 258, rx: 48, ry: 14, fill: '#7FC8D9' }], ['ellipse', { cx: 80, cy: 255, rx: 40, ry: 9, fill: '#B5E3EC' }],
    ['ellipse', { cx: 340, cy: 268, rx: 40, ry: 12, fill: '#7FC8D9' }],
    ...[0, 1, 2].flatMap(r => [0, 1, 2].map(c => ['circle', { cx: 290 + c * 16, cy: 200 + r * 14, r: 5, fill: r === 1 ? '#E88FA6' : '#FFC9B5', stroke: '#E88FA6', 'stroke-width': 1.5 }])),
    ['path', { d: 'M140 268 l6 -14 l6 14 l14 2 l-11 9 l4 14 l-13 -8 l-13 8 l4 -14 l-11 -9 Z', fill: '#FF8A7A' }]
  ],
  // Fizz, science: a sunny reef with light rays, swaying kelp and rising bubbles.
  reef: () => ['g', {},
    ...sky('sky-reef', '#1D7C8C', '#0B3D4F'),
    ...[60, 170, 290].map((x, i) => ['polygon', { points: `${x},0 ${x + 40},0 ${x + 90},300 ${x + 30},300`, fill: '#9AD9F2', opacity: 0.12, class: `ray r${i}` }]),
    ['path', { d: 'M0 240 Q 100 222 200 236 T 400 232 V 300 H 0 Z', fill: '#E9D3A1' }],
    ['path', { d: 'M0 240 Q 100 222 200 236 T 400 232 L 400 240 Q 300 246 200 244 T 0 248 Z', fill: '#F5E6C2' }],
    ...[[40, 238], [70, 236], [350, 234]].map(([x, y], i) => ['path', { d: `M${x} ${y} C ${x - 10} ${y - 50}, ${x + 14} ${y - 80}, ${x + 2} ${y - 130}`, fill: 'none', stroke: i === 1 ? '#3FA36A' : '#2E8B57', 'stroke-width': 7, 'stroke-linecap': 'round', class: `kelp k${i}` }]),
    ['g', { transform: 'translate(300 200)' },
      ['circle', { cx: 0, cy: 20, r: 22, fill: '#FF8A7A' }], ['circle', { cx: 26, cy: 26, r: 16, fill: '#FFB36B' }], ['circle', { cx: -22, cy: 28, r: 14, fill: '#FF9AB8' }]],
    ...[[120, 0], [250, 1], [330, 2], [90, 1]].map(([x, i]) => ['circle', { cx: x, cy: 230, r: 4 + i, fill: 'none', stroke: '#CFF4FF', 'stroke-width': 2, class: `bubble b${i}` }])
  ],
  // Atlas, social studies: a riverbank camp with a tent, a flag and a signpost.
  riverbank: () => ['g', {},
    ...sky('sky-river', '#BFE3EE', '#E8F4E6'),
    ['path', { d: 'M0 120 Q 80 80 160 110 T 320 100 T 400 115 V 160 H 0 Z', fill: '#9CC9A8' }],
    ...[[40, 150], [90, 140], [360, 145]].map(([x, y]) => ['g', {}, ['rect', { x: x - 4, y, width: 8, height: 30, fill: '#7A5236' }], ['circle', { cx: x, cy: y - 10, r: 22, fill: '#3E7D5A' }], ['circle', { cx: x - 6, cy: y - 16, r: 10, fill: '#57A06F' }]]),
    ['path', { d: 'M0 175 H 400 V 300 H 0 Z', fill: '#8FBF6A' }],
    ['path', { d: 'M0 175 H 400 V 182 H 0 Z', fill: '#A8D483' }],
    ['path', { d: 'M260 300 C 280 260, 330 240, 400 236 V 300 Z', fill: '#5BA4C7', class: 'river' }],
    ['path', { d: 'M300 280 q 20 -8 40 0', fill: 'none', stroke: '#9AD3EC', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'wave-line' }],
    ['g', { transform: 'translate(70 196)' }, ['path', { d: 'M0 50 L 36 0 L 72 50 Z', fill: '#E9A62A' }], ['path', { d: 'M36 0 L 46 50 L 26 50 Z', fill: '#C4841A' }]],
    ['g', { transform: 'translate(150 190)' }, ['rect', { x: 0, y: 0, width: 4, height: 50, fill: '#7A5236' }], ['path', { d: 'M4 2 L 34 10 L 4 18 Z', fill: '#FE6B5B', class: 'flag' }]],
    ['g', { transform: 'translate(330 196)' }, ['rect', { x: 0, y: 0, width: 5, height: 44, fill: '#7A5236' }], ['rect', { x: -18, y: 4, width: 42, height: 12, rx: 3, fill: '#F5F1E6' }], ['path', { d: 'M24 4 l8 6 l-8 6 Z', fill: '#F5F1E6' }]]
  ]
};

// Items on Lumi's cliff, one for each step of her path (engine/retention.js PATH). A wide stage shows only
// the lower part of the scene (it is cropped from the top), so every item sits below y = 105.
function flower(x, y, color) {
  return ['g', {},
    ['path', { d: `M${x} ${y} v 10`, stroke: '#2F6647', 'stroke-width': 2, 'stroke-linecap': 'round' }],
    ...[[0, -4], [4, 0], [0, 4], [-4, 0]].map(([dx, dy]) => ['circle', { cx: x + dx, cy: y + dy, r: 3, fill: color }]),
    ['circle', { cx: x, cy: y, r: 2.2, fill: '#FFF4C2' }]];
}

function bunting() {
  const p0 = [31, 160], c = [76, 172], p1 = [122, 142];
  const along = t => [0, 1].map(i => (1 - t) ** 2 * p0[i] + 2 * t * (1 - t) * c[i] + t ** 2 * p1[i]);
  const colors = ['#FE6B5B', '#E9A62A', '#8BF0D0'];
  return ['g', { class: 'item' },
    ['rect', { x: 29, y: 156, width: 4, height: 34, rx: 1.5, fill: '#7A5236' }],
    ['rect', { x: 120, y: 138, width: 4, height: 32, rx: 1.5, fill: '#7A5236' }],
    ['path', { d: `M${p0} Q ${c} ${p1}`, fill: 'none', stroke: '#F5F1E6', 'stroke-width': 1.5 }],
    ...[0.14, 0.28, 0.42, 0.56, 0.7, 0.84].map((t, i) => {
      const [x, y] = along(t);
      return ['path', { d: `M${(x - 4).toFixed(1)} ${y.toFixed(1)} h 8 l -4 9 Z`, fill: colors[i % 3], class: 'flag' }];
    })];
}

const PATH_ITEMS = {
  flowers: () => ['g', { class: 'item' }, ...[[40, 250, '#FF9AB8'], [58, 262, '#FFD36E'], [110, 256, '#F5F1E6'], [300, 252, '#FFD36E'], [330, 264, '#FF9AB8'], [352, 250, '#F5F1E6']].map(([x, y, c]) => flower(x, y, c))],
  gull: () => ['g', { class: 'item glide' }, ...[[96, 128], [120, 117]].map(([x, y]) => ['path', { d: `M${x} ${y} q 5 -5 10 0 q 5 -5 10 0`, fill: 'none', stroke: '#F5F1E6', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }])],
  kite: () => ['g', { class: 'item kite' },
    ['path', { d: 'M22 142 q -7 9 -1 16 q 6 7 -1 14', fill: 'none', stroke: '#F5F1E6', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.85 }],
    ['path', { d: 'M18 156 l4 -3 l1 5 Z M19 166 l4 -3 l1 5 Z', fill: '#E9A62A' }],
    ['polygon', { points: '22,108 33,124 22,142 11,124', fill: '#FE6B5B' }],
    ['polygon', { points: '22,108 33,124 22,124', fill: '#FF8A7A' }],
    ['path', { d: 'M22 108 V 142 M11 124 H 33', stroke: '#F5F1E6', 'stroke-width': 1.2 }]],
  sailboat: () => ['g', { class: 'item rock' },
    ['path', { d: 'M344 192 H 380 L 373 201 H 351 Z', fill: '#8A5A3C' }],
    ['rect', { x: 361, y: 156, width: 2.5, height: 37, fill: '#6E4630' }],
    ['path', { d: 'M364 158 L 364 189 L 381 189 Z', fill: '#F5F1E6' }],
    ['path', { d: 'M360 164 L 360 189 L 346 189 Z', fill: '#E9A62A' }]],
  bunting,
  telescope: () => ['g', { class: 'item' },
    ['path', { d: 'M80 214 L 70 238 M80 214 L 90 238 M80 214 L 80 238', stroke: '#6E4630', 'stroke-width': 2.5, 'stroke-linecap': 'round' }],
    ['path', { d: 'M66 212 L 96 200 L 99 207 L 69 219 Z', fill: '#E9A62A' }],
    ['path', { d: 'M66 212 L 96 200 L 97 203 L 67 215 Z', fill: '#FFC75A' }],
    ['path', { d: 'M93 199 L 101 196 L 104 205 L 96 208 Z', fill: '#1E2F4D' }]],
  cottage: () => ['g', { class: 'item' },
    ['rect', { x: 287, y: 156, width: 6, height: 12, fill: '#8A5A3C' }],
    ['rect', { x: 284, y: 170, width: 34, height: 24, fill: '#F5F1E6' }],
    ['path', { d: 'M279 172 L 301 152 L 323 172 Z', fill: '#FE6B5B' }],
    ['path', { d: 'M279 172 L 301 152 L 301 158 L 286 172 Z', fill: '#FF8A7A' }],
    ['rect', { x: 297, y: 180, width: 8, height: 14, rx: 1, fill: '#8A5A3C' }],
    ['rect', { x: 287, y: 177, width: 7, height: 7, rx: 1, fill: '#FFD36E', class: 'glow' }],
    ['rect', { x: 308, y: 177, width: 7, height: 7, rx: 1, fill: '#FFD36E', class: 'glow' }]],
  whale: () => ['g', { class: 'item rock' },
    ['path', { d: 'M384 214 q -1 -9 -9 -14 q 8 -1 11 6 q 3 -7 11 -6 q -8 5 -9 14 Z', fill: '#5B7FB0' }],
    ['path', { d: 'M372 215 q 14 -4 28 0', fill: 'none', stroke: '#4A6A9E', 'stroke-width': 2, 'stroke-linecap': 'round' }]],
  balloon: () => ['g', { class: 'item float' },
    ['path', { d: 'M312 136 L 315 148 M324 136 L 321 148', stroke: '#8A5A3C', 'stroke-width': 1 }],
    ['circle', { cx: 318, cy: 124, r: 14, fill: '#E9A62A' }],
    ['path', { d: 'M318 110 C 311 116, 311 132, 318 138 C 325 132, 325 116, 318 110 Z', fill: '#FE6B5B' }],
    ['rect', { x: 314, y: 147, width: 8, height: 6, rx: 1, fill: '#8A5A3C' }]],
  moon: () => ['g', { class: 'item' },
    ['path', { d: 'M376 106 a14 14 0 1 0 9 25 a11 11 0 1 1 -9 -25 Z', fill: '#F5F1E6' }],
    ['path', { d: 'M350 136 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z', fill: '#FFE9A6', class: 'twinkle t1' }]]
};

// Keepsakes: one small drawing per kind, on a 32 by 32 grid, in the scenes' palette.
const KEEPSAKE_ART = {
  shell: () => [['path', { d: 'M16 5 L 27 24 Q 16 30 5 24 Z', fill: '#FFC9B5' }], ['path', { d: 'M16 5 L 21 25 M16 5 L 11 25 M16 5 V 27', stroke: '#E88FA6', 'stroke-width': 1.5, fill: 'none' }]],
  starfish: () => [['path', { d: 'M16 3 l3.4 8 8.6 .8 -6.6 5.6 2 8.4 -7.4 -4.5 -7.4 4.5 2 -8.4 -6.6 -5.6 8.6 -.8 Z', fill: '#FF8A7A' }], ['circle', { cx: 16, cy: 15, r: 1.6, fill: '#FFC9B5' }]],
  'sea-glass': () => [['path', { d: 'M9 8 L 22 6 L 27 16 L 20 26 L 8 23 L 5 14 Z', fill: '#8BF0D0' }], ['path', { d: 'M10 10 L 18 9 L 12 15 Z', fill: '#E6FFF7' }]],
  feather: () => [['path', { d: 'M7 26 C 9 15, 16 7, 26 5 C 25 14, 18 22, 7 26 Z', fill: '#B9C3D8' }], ['path', { d: 'M5 28 L 22 10', stroke: '#4F5B70', 'stroke-width': 1.5, 'stroke-linecap': 'round' }]],
  pebble: () => [['ellipse', { cx: 16, cy: 18, rx: 11, ry: 8, fill: '#9AA6B8' }], ['ellipse', { cx: 13, cy: 15, rx: 4, ry: 2.2, fill: '#C9D1DE' }]],
  acorn: () => [['ellipse', { cx: 16, cy: 19, rx: 7, ry: 9, fill: '#C4841A' }], ['path', { d: 'M7 14 Q 16 4 25 14 Z', fill: '#7A5236' }], ['path', { d: 'M16 7 V 4', stroke: '#7A5236', 'stroke-width': 2, 'stroke-linecap': 'round' }]],
  leaf: () => [['path', { d: 'M16 3 C 26 8, 27 19, 16 28 C 5 19, 6 8, 16 3 Z', fill: '#E9672A' }], ['path', { d: 'M16 6 V 29 M16 14 L 21 10 M16 19 L 11 15', stroke: '#B04A3A', 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }]],
  'sand-dollar': () => [['circle', { cx: 16, cy: 16, r: 11, fill: '#F4D9A8' }],
    ...[0, 1, 2, 3, 4].map(k => { const a = (k * 72 - 90) * Math.PI / 180; return ['ellipse', { cx: (16 + 5 * Math.cos(a)).toFixed(1), cy: (16 + 5 * Math.sin(a)).toFixed(1), rx: 1.6, ry: 3, fill: '#DDBB82', transform: `rotate(${k * 72} ${(16 + 5 * Math.cos(a)).toFixed(1)} ${(16 + 5 * Math.sin(a)).toFixed(1)})` }]; })]
};

export function keepsakeTree(id, cls = 'keepsake') {
  return ['svg', { viewBox: '0 0 32 32', class: cls, 'aria-hidden': 'true', focusable: 'false' }, ...(KEEPSAKE_ART[id] || KEEPSAKE_ART.pebble)()];
}

// Which scene each guide lives in.
export const HOME = { pip: 'harbor', lumi: 'cliff', tally: 'tidepool', fizz: 'reef', atlas: 'riverbank' };

// Where a guide stands in each scene: x is its home spot, y is the ground line its feet rest on
// (the top of the dock, the sand, the grass). Walks stay on the ground and clear of the pools and the river.
export const GROUND = {
  harbor: { x: 200, y: 217 }, cliff: { x: 200, y: 252 }, tidepool: { x: 205, y: 246 }, reef: { x: 200, y: 252 }, riverbank: { x: 190, y: 262 }
};
// A guide is drawn ACTOR wide (the art is 200 by 240). In the art, the feet end at y = 217 and the drawn
// shadow sits below them, from y = 216: the shadow is clipped off and the scene draws its own on the ground.
export const ACTOR = 100;
const ART_FEET = 217 / 240;
const LAMP = { x: 0, y: 63 / 240 }; // the middle of Lumi's lantern, in the art
// Art coordinates (200 by 240) to the guide's own scene units: x from its middle, y up from the ground (negative is up).
const art = (x, y) => [(x - 100) * ACTOR / 200, (y - 217) * ACTOR / 200];

// Where each walking guide's two outer feet touch the ground, left then right, in scene units from its middle
// (grades 3 to 5 art). Every lean pivots on one of these two points, so a planted foot cannot slide.
export const FEET = { pip: [art(79, 0)[0], art(121, 0)[0]], tally: [art(40, 0)[0], art(140, 0)[0]], fizz: [art(76, 0)[0], art(124, 0)[0]], atlas: [art(78, 0)[0], art(122, 0)[0]] };

// How far each guide goes from its home spot (scene units, to the right), and the one thing it touches there.
// part: the round end of the guide's own item or claw (middle and radius). edge: a flat side of a scene object
// at that x. circle: a round scene object. tools/walk-keyframes.mjs works out the standing spot from these so the
// part lands on the object when the guide leans; a unit test checks the contact.
export const BOOKS = { x: 318, y: 182 }; // Pip's book stack; its top book starts 2 units in
export const SHELL = { x: 290, y: 228, r: 5.75 }; // the nearest counting shell, with its outline
export const REACH = {
  pip: { part: { at: art(168.7, 149.2), r: 2.45 }, edge: { x: BOOKS.x + 2, top: BOOKS.y + 2 - GROUND.harbor.y, bottom: BOOKS.y + 12 - GROUND.harbor.y }, lean: 5 },
  tally: { part: { at: art(149.9, 163.6), r: 8.25 }, circle: { x: SHELL.x, y: SHELL.y - GROUND.tidepool.y, r: SHELL.r }, lean: 3 },
  fizz: { walk: 45 },
  atlas: { walk: 50 }
};

// The guide inside the scene, so it stands on the ground at every stage size. The groups, outside in:
// track (travels across), shadow (stays on the ground), face (turns round), lift (leaves the ground in a step),
// reach (Tally's sideways stretch, held at the left foot), tilt-l and tilt-r (lean on the left or the right foot),
// squash (bends at the ground). Each lean group sits at its own foot, so it can only turn about that foot.
const at = (x, cls, child) => ['g', { transform: `translate(${x} 0)` }, ['g', { class: cls }, ['g', { transform: `translate(${-x} 0)` }, child]]];
function actorTree(name, { src, beam, guide }) {
  const g = GROUND[name] || GROUND.harbor;
  const w = ACTOR, hgt = ACTOR * 1.2, feet = hgt * ART_FEET;
  const [fl, fr] = FEET[guide] || [-10, 10];
  const drawing = ['g', { class: 'actor-squash' },
    beam ? beamTree(LAMP.x * w, LAMP.y * hgt - feet) : null,
    ['image', { href: src, x: -w / 2, y: -feet, width: w, height: hgt, 'clip-path': 'url(#actor-feet)' }]];
  return ['g', { transform: `translate(${g.x} ${g.y})` },
    ['defs', {}, ['clipPath', { id: 'actor-feet' }, ['rect', { x: -w, y: -hgt - 10, width: 2 * w, height: hgt + 10.5 }]]],
    ['g', { class: 'actor-track' },
      ['ellipse', { class: 'actor-shadow', cx: 0, cy: 1, rx: w * 0.27, ry: w * 0.035, fill: '#000', opacity: 0.22 }],
      ['g', { class: 'actor-face' },
        ['g', { class: 'actor-lift' },
          at(fl, 'actor-reach', at(fl, 'actor-tilt-l', at(fr, 'actor-tilt-r', drawing)))]]]];
}

// Lumi's beam: a flat cone of light from her lantern out to the right, as in her clip. It sweeps from the lamp.
function beamTree(x, y) {
  return ['g', { transform: `translate(${x} ${y})` },
    ['defs', {}, ['linearGradient', { id: 'beam-fade', x1: 0, y1: 0, x2: 1, y2: 0 },
      ['stop', { offset: 0, 'stop-color': '#FFD36E', 'stop-opacity': 0.6 }], ['stop', { offset: 1, 'stop-color': '#FFD36E', 'stop-opacity': 0.08 }]]],
    ['polygon', { class: 'beam', points: '12,-4 420,-70 420,70 12,4', fill: 'url(#beam-fade)' }]];
}

// A scene with its unlocked cliff items (Lumi's only) and, when given, the guide standing in it.
export function sceneTree(name, items = [], actor = null) {
  const make = SCENES[name] || SCENES.harbor;
  return ['svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMax slice', class: `scene-bg scene-${name}`, 'aria-hidden': 'true', focusable: 'false' },
    make(), ...items.filter(id => PATH_ITEMS[id]).map(id => PATH_ITEMS[id]()), actor ? actorTree(name, actor) : null];
}

// Serializes a tree to SVG text (used by tools/render-stage.mjs, never by the page).
export function treeToSvg(node) {
  if (!Array.isArray(node)) return '';
  const [tag, attrs, ...kids] = node;
  const a = Object.entries(attrs || {}).map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`).join('');
  const inner = kids.map(treeToSvg).join("");
  return `<${tag}${a}${tag === 'svg' ? ' xmlns="http://www.w3.org/2000/svg"' : ''}>${inner}</${tag}>`;
}
