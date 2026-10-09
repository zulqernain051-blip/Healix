const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTs } = require('./load-ts.cjs');
const { THEMES, isThemeId } = loadTs('src/theme.ts');

function luminance(hex) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

test('only registered appearance IDs are accepted for saved preferences', () => {
  assert.equal(isThemeId('minimal-clean'), true);
  assert.equal(isThemeId('dark-futuristic'), true);
  for (const id of [null, undefined, '', 'dark', '__proto__', 'toString', 1]) assert.equal(isThemeId(id), false);
  assert.deepEqual(Object.keys(THEMES['minimal-clean'].colors).sort(), Object.keys(THEMES['dark-futuristic'].colors).sort());
});

test('both appearance palettes keep body and helper text readable on their surfaces', () => {
  for (const [id, { colors: c }] of Object.entries(THEMES)) {
    for (const bg of ['surface', 'surfaceCard', 'surfaceMuted']) for (const fg of ['textDark', 'textBody', 'textMuted']) {
      assert.ok(contrast(c[fg], c[bg]) >= 4.5, `${id}: ${fg} on ${bg}`);
    }
    for (const bg of ['navy', 'navyDark', 'tealFill', 'emeraldFill', 'redFill', 'amberFill', 'purpleFill', 'pinkFill', 'actionStart', 'actionMid', 'actionEnd']) {
      assert.ok(contrast(c.onAccent, c[bg]) >= 4.5, `${id}: inverse text on ${bg}`);
    }
  }
});
