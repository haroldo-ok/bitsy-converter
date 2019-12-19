import {parseWorld} from 'bitsy-parser';

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

const toBinaryConst = a => `B${a.join('')}`;
const convertTile = tile => transpose(tile).map(row => toBinaryConst(row.reverse())).join(', ');

const toEnumDeclaration = (name, object) =>`
enum ${name} {
${ Object.entries(object).map(([k, i]) => `  ${k} = ${i}`).join(',\n') }
};`

const toTileFrames = images => `{
${ Object.entries(images).map(([k, v]) => {
  const frames = v.map(convertTile);
  return  `  // ${k}
  { ${ frames.map(f => `{ ${f} }`).join('\n  ') } }`;
}).join('\n') }
}`

const toImageDeclaration = (name, frames) => `
const uint8_t PROGMEM ${name}[${frames.length}][8] = { ${ frames.map(f => `{ ${convertTile(f)} }`) } };
`.trim();

export const convertArduboy = code => {
  const world = parseWorld(code);
  const imageIndexes = Object.fromEntries(Object.keys(world.images).map((k, i) => [k, i]));

  return [
	  toEnumDeclaration('ImageIndex', imageIndexes),
	  ...Object.entries(world.images).map(([k, v]) => toImageDeclaration(`img_${k}`, v)),
  ].join('\n\n');
}
