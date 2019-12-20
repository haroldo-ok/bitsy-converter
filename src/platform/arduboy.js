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

const toConstantDeclaration = (name, type, value) => `const ${type} ${name} = ${value};`;

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
  const frameCount = imageInfos.reduce((total, info) => total + info.frames.length, 0);
  
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
	  toEnumDeclaration('ImageOffsets', imageIndexes, k => `ofs_${k}`),
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');

  return `
#include <Arduboy.h>

Arduboy arduboy;

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
}

${mainGeneratedBody};

void loop() {
  // put your main code here, to run repeatedly:
  if (!arduboy.nextFrame()) return;

  // Run twice every second.
  if (arduboy.everyXFrames(30))
  {
    arduboy.clear();
    arduboy.setCursor(0, 56);
    arduboy.print("Hello World");
    
    // Fill the background with the tiles
    uint8_t tn = 0;
    for (uint8_t ty = 0; ty != 7; ty++) {
      for (uint8_t tx = 0; tx != 16; tx++) {
        arduboy.drawBitmap(tx * 8, ty * 8, images[tn], 8, 8, WHITE);
        tn = (tn + 1) % FRAME_COUNT;
      }
    }
    
	  arduboy.display();
  }
}
`;
}