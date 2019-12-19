import {parseWorld} from 'bitsy-parser';

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

const toBinaryConst = a => `B${a.join('')}`;
const convertTile = tile => transpose(tile).map(row => toBinaryConst(row.reverse())).join(', ');

export const convertArduboy = code => {
  const world = parseWorld(code);
  return Object.entries(world.images).map(([k, v]) => {
    const frames = v.map(convertTile);
    return  `const uint8_t PROGMEM img_${k}[] = { ${frames.join('\n')} };`;
  }).join('\n');
}
