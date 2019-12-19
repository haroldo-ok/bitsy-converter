import {parseWorld} from 'bitsy-parser';

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

export const convertArduboy = code => {
  const world = parseWorld(code);
  return Object.entries(world.images).map(([k, v]) => {
    const frames = v.map(frame => {
      return transpose(frame).map(row => 'B' + row.reverse().join('')).join(', ');
    });
    return  `const uint8_t PROGMEM img_${k}[] = { ${frames.join('\n')} };`;
  }).join('\n');
}
