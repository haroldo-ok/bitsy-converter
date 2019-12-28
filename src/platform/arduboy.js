import {groupBy} from 'lodash-es';

import {parseWorld} from 'bitsy-parser';

/** 
 * Returns a transposed version of a bidimensional array. 
 */
const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

/** 
 * Receives an array containing one binary number per element, and turns it into a 
 * string with the format Bnnnn.
 */
const toBinaryConst = a => `B${a.join('')}`;

/** 
 * Generates a image constant declaration from a bidimensional array. 
 * Assumes the array is 8x8.
 */
const convertTile = tile => transpose(tile).map(row => toBinaryConst(row.reverse())).join(', ');

/**
 * Generates a C++ enum declaration from a JS object.
 */
const toEnumDeclaration = (name, object, keyFunction = k => k) =>`
enum ${name} {
${ Object.entries(object).map(([k, i]) => `  ${keyFunction(k)} = ${i}`).join(',\n') }
};`

/** 
 * Generates a C constant containing all the images contained in imageInfos
 */
const toImageDeclaration = (name, imageInfos) => {
  const content = imageInfos.map(({name, frames, index, offset}) => `
  // ${name}: index ${index}, offset ${offset}, ${frames.length} frame(s)
  ${frames.map(frame => `{ ${convertTile(frame)} }`).join(',\n  ')}`).join(',');
  
  return `const uint8_t PROGMEM ${name}[][8] = { 
${content} 
};`
}

/**
 * Generates a C constant declaration.
 */
const toConstantDeclaration = (name, type, value) => `const ${type} ${name} = ${value};`;

/**
 * Generates a flat C array constant from a bidimensional JS array.
 */
const toMatrixDeclaration = (matrix, transform = v => v, innerIndent = '\n    ') => 
  matrix.map(row => `{ ${row.map(cell => transform(cell)).join(', ')} }`).join(`,${innerIndent}`);

/**
 * Generates a C constant from a room object.
 */
const toRoomDeclaration = (room) => `
  // Room ${room.id}
  {{
    ${ toMatrixDeclaration(room.tilemap) }
  }, ${room.sprites.length}, room_${room.id}_sprites}
`;

/**
 * Generates a C constant representing all the rooms contained in a room object.
 */
const toRoomsDeclaration = (name, roomInfos) => {
  const spriteDeclarations = roomInfos.map(room => toConstantDeclaration(`room_${room.id}_sprites[]`, 'BitsySprite PROGMEM', `{
  ${ room.sprites.map(sprite => `{ ofs_${sprite.drw}, ${sprite.x}, ${sprite.y} }`).join(',\n  ') }
}`));
  
  const roomsDeclaration = toConstantDeclaration(`${name}[]`, 'Room PROGMEM', `{
${ roomInfos.map(room => toRoomDeclaration(room)).join(',') }
}`);

  return [...spriteDeclarations, roomsDeclaration].join('\n\n');
}

/**
 * Generates an object containing various information about the images contained in the world object.
 */
const extractImageInfos = world => {
  const withBlank = [ ['BLANK', [ Array(8).fill(Array(8).fill(0)) ] ], ...Object.entries(world.images) ];
  const imageInfos = withBlank.map(([name, frames], index) => ({ name, frames, index }));
  
  const withOffsets = imageInfos.reduce(({offset, results}, info) => ({
    offset: offset + info.frames.length,
    results: [...results, {offset, ...info}]
  }), {offset: 0, results: []}).results;  
  
  return withOffsets;
}

/**
 * Generates an array containing information about the rooms contained in the world object.
 */
const extractRoomInfos = (world, imageOffsets) => {
  const spritesPerRoom = groupBy(Object.values(world.sprite), 'room');
  return Object.values(world.room).map(room => ({
    ...room,
    sprites: spritesPerRoom[room.id] || [],
    tilemap: room.tilemap.map(row => row.map(v => v === '0' ? 0 : imageOffsets[world.tile[v].drw]))
  }));
};

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object.
 */
export const convertArduboy = code => {
  const world = parseWorld(code);
  const imageInfos = extractImageInfos(world);
  
  const imageOffsets = Object.fromEntries(imageInfos.map(({name, offset}) => [name, offset]));
  const frameCount = imageInfos.reduce((total, info) => total + info.frames.length, 0);
  
  const roomInfos = extractRoomInfos(world, imageOffsets);
  
  const imageOffsetBody = toEnumDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`);
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toRoomsDeclaration('rooms', roomInfos),
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');

  return `
#include <Arduboy2.h>

Arduboy2 arduboy;

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
}

${imageOffsetBody}

typedef struct {
    ImageOffset image;
    uint8_t x, y;
} BitsySprite;

typedef struct Room {
    uint8_t tileMap[16][16];
    
    uint8_t spriteCount;
    BitsySprite *sprites;
} Room;

${mainGeneratedBody}

uint8_t currentLevel = 0;

void drawTile(uint8_t tx, uint8_t ty, uint8_t tn) {
  arduboy.drawBitmap(tx * 8, ty * 8, images[tn], 8, 8, WHITE);
}

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
    for (uint8_t ty = 0; ty != 7; ty++) {
      for (uint8_t tx = 0; tx != 16; tx++) {
        uint8_t tn = pgm_read_byte(&rooms[currentLevel].tileMap[ty][tx]);
        drawTile(tx, ty, tn);
      }
    }
    
    // Draw the sprites on top of the background
    for (uint8_t i = 0; i != rooms[currentLevel].spriteCount; i++) {
      BitsySprite *spr = rooms[currentLevel].sprites + i;
      drawTile(spr->x, spr->y, spr->image);
    }
    
	  arduboy.display();
  }
}
`;
}
