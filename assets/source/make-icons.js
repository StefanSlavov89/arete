// Generates every app icon PNG from one design (the "ring of days" A).
// Usage: node assets/source/make-icons.js <path-to-@resvg/resvg-js>
// The design lives in a 96×96 unit box centred on (48, 48).
const fs = require('fs');
const path = require('path');
const { Resvg } = require(process.argv[2] || '@resvg/resvg-js');

const C = { bg: '#121110', cream: '#F2EFE9', orange: '#F07A3E', dim: '#34312D' };
const OUT = path.join(__dirname, '..');

const DOTS = 36; // dots around the ring
const TODAY = 31; // the 31st dot is "today" (~85% of the year gone)

/** The mark itself. `mono` = single-colour version for Android themed icons. */
function mark({ mono = false, letterOnly = false } = {}) {
  const lit = mono ? '#fff' : C.cream;
  const letter =
    `<path d="M35 64 L46.5 30 H49.5 L61 64" fill="none" stroke="${lit}" stroke-width="5"/>` +
    `<rect x="31" y="62" width="9" height="3" fill="${lit}"/>` +
    `<rect x="56" y="62" width="9" height="3" fill="${lit}"/>` +
    `<rect x="40" y="52" width="16" height="4" fill="${lit}"/>`;
  if (letterOnly) return letter;
  const ahead = mono ? 'rgba(255,255,255,0.35)' : C.dim;
  const today = mono ? '#fff' : C.orange;
  let dots = '';
  for (let k = 0; k < DOTS; k++) {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / DOTS;
    const x = (48 + 32 * Math.cos(a)).toFixed(2);
    const y = (48 + 32 * Math.sin(a)).toFixed(2);
    const isToday = k === TODAY - 1;
    const fill = isToday ? today : k < TODAY - 1 ? lit : ahead;
    dots += `<circle cx="${x}" cy="${y}" r="${isToday ? 3.2 : 2.2}" fill="${fill}"/>`;
  }
  return dots + letter;
}

/** Wrap the mark: optional background, scaled around the centre (cy lets the letter sit centred). */
function svg({ scale = 1, bg = null, radius = 0, mono = false, letterOnly = false, cy = 48 } = {}) {
  const back = bg ? `<rect width="96" height="96" rx="${radius}" fill="${bg}"/>` : '';
  const t = `translate(48 48) scale(${scale}) translate(-48 -${cy})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${back}<g transform="${t}">${mark({ mono, letterOnly })}</g></svg>`;
}

/**
 * Splash: mark + "ARETE" wordmark. Android 12+ crops the splash image to a centred
 * circle 2/3 of its width (radius 32 in this 96 box), so everything stays inside it.
 */
function splash() {
  const t = 'translate(48 39) scale(0.56) translate(-48 -48)';
  const word =
    `<text x="48.6" y="70.5" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" ` +
    `font-size="7.2" letter-spacing="2.6" fill="${C.cream}">ARETE</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g transform="${t}">${mark()}</g>${word}</svg>`;
}

const solid = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="${color}"/></svg>`;

// Android adaptive icons are masked to ~66% of the canvas, so the mark shrinks to fit that safe zone.
const targets = [
  ['icon.png', 1024, svg({ bg: C.bg, scale: 1.02 })], // iOS + fallback; iOS rounds corners itself
  ['android-icon-foreground.png', 1024, svg({ scale: 0.8 })],
  ['android-icon-background.png', 1024, solid(C.bg)],
  ['android-icon-monochrome.png', 1024, svg({ scale: 0.8, mono: true })],
  ['favicon.png', 48, svg({ bg: C.bg, radius: 20, scale: 1.05 })],
  // Android status-bar icon: white on transparent, letter only (dots blur at 24dp).
  ['notification-icon.png', 96, svg({ mono: true, letterOnly: true, scale: 2, cy: 47.5 })],
  // Splash: the full mark on transparent, shown on the dark splash background.
  ['splash-icon.png', 1024, splash()],
];

fs.writeFileSync(path.join(__dirname, 'icon.svg'), svg({ bg: C.bg, radius: 22 }));
for (const [name, size, source] of targets) {
  const opts = { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: true } };
  const png = new Resvg(source, opts).render().asPng();
  fs.writeFileSync(path.join(OUT, name), png);
  console.log(`${name} ${size}x${size}`);
}
