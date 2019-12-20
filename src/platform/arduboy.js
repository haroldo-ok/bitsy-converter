import {parseWorld} from 'bitsy-parser';

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

const toBinaryConst = a => `B${a.join('')}`;
const convertTile = tile => transpose(tile).map(row => toBinaryConst(row.reverse())).join(', ');

const toEnumDeclaration = (name, object, keyFunction = k => k) =>`
enum ${name} {
${ Object.entries(object).map(([k, i]) => `  ${keyFunction(k)} = ${i}`).join(',\n') }
};`

const toImageDeclaration = (name, imageInfos) => {
  const content = imageInfos.map(({name, frames, index, offset}) => `
  // ${name}: index ${index}, offset ${offset}, ${frames.length} frame(s)
  ${frames.map(frame => `{ ${convertTile(frame)} }`).join(',\n  ')}`).join(',');
  
  return `const uint8_t PROGMEM ${name}[][8] = { 
${content} 
};`
}

const extractImageInfos = world => {
  const withBlank = [ ['BLANK', [ Array(8).fill(Array(8).fill(0)) ] ], ...Object.entries(world.images) ];
  const imageInfos = withBlank.map(([name, frames], index) => ({ name, frames, index }));
  
  const withOffsets = imageInfos.reduce(({offset, results}, info) => ({
    offset: offset + info.frames.length,
    results: [...results, {offset, ...info}]
  }), {offset: 0, results: []}).results;  
  
  return withOffsets;
}

export const convertArduboy = code => {
  const world = parseWorld(code);
  const imageInfos = extractImageInfos(world);
  
  const imageIndexes = Object.fromEntries(imageInfos.map(({name, offset}) => [name, offset]));

  return [
	  toEnumDeclaration('ImageOffsets', imageIndexes, k => `ofs_${k}`),
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');
}
