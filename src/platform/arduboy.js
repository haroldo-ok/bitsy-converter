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

const generateUnknownDialogCommand = command => `/* Unknown command: ${command.type} name=${command.name} mode=${command.mode} */`;

const generatePrintDialogCommand = command => `showDialog("${command.arguments[0].value}");`;

const generateBlockDialogCommand = command => command.children
  .map(child => child.type === 'function'&& child.name === 'print' ? generatePrintDialogCommand(child) : generateUnknownDialogCommand(child)).join('\n  ');

/**
 * Generates a dialog function.
 */
const toDialogDeclaration = (name, dialog) => {
  const content = dialog.type === 'block' && dialog.mode === 'dialog' ?
    generateBlockDialogCommand(dialog) : generateUnknownDialogCommand(dialog);
  return `void dialog_${name}() {
  ${content}  
}`;
}

/**
 * Generates dialog functions from the world object
 */
const toDialogsDeclaration = world => Object.entries(world.dialog).map(([name, dialog]) => toDialogDeclaration(name, dialog)).join('\n\n');

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
 * Generates a C constant from a sprite object.
 */
const toSpriteDeclaration = sprite => `{ ofs_${sprite.drw}, ${sprite.x}, ${sprite.y}${sprite.dlg ? `, dialog_${sprite.dlg}` : ''} }`;

/**
 * Generates a C constant representing all the rooms contained in a room object.
 */
const toRoomsDeclaration = (name, roomInfos) => {
  const spriteDeclarations = roomInfos.map(room => toConstantDeclaration(`room_${room.id}_sprites[]`, 'BitsySprite PROGMEM', `{
  ${ room.sprites.map(toSpriteDeclaration).join(',\n  ') }
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
 * Checks if a given sprite is from the player.
 */
const isPlayerSprite = (sprite, world) => sprite.id === world.playerId;

/**
 * Generates an array containing information about the rooms contained in the world object.
 */
const extractRoomInfos = (world, imageOffsets) => {
  const spritesPerRoom = groupBy(Object.values(world.sprite), 'room');
  return Object.values(world.room).map(room => ({
    ...room,
    sprites: (spritesPerRoom[room.id] || []).filter(sprite => !isPlayerSprite(sprite, world)),
    tilemap: room.tilemap.map(row => row.map(v => v === '0' ? 0 : imageOffsets[world.tile[v].drw]))
  }));
};

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object.
 */
export const convertArduboy = code => {
  const world = parseWorld(code, {parseScripts: true});
  const imageInfos = extractImageInfos(world);
  
  const imageOffsets = Object.fromEntries(imageInfos.map(({name, offset}) => [name, offset]));
  const frameCount = imageInfos.reduce((total, info) => total + info.frames.length, 0);
  
  const roomInfos = extractRoomInfos(world, imageOffsets);
  const playerSpriteStart = Object.values(world.sprite).find(sprite => isPlayerSprite(sprite, world));
  
  const imageOffsetBody = toEnumDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`);
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toConstantDeclaration('playerSpriteStart', 'BitsySprite PROGMEM', toSpriteDeclaration(playerSpriteStart)),
    toDialogsDeclaration(world),
    toRoomsDeclaration('rooms', roomInfos),
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');

  return `
#include <Arduboy2.h>

Arduboy2 arduboy;

${imageOffsetBody}

typedef struct {
    ImageOffset image;
    uint8_t x, y;
    void  (*dialog)();
} BitsySprite;

typedef struct Room {
    uint8_t tileMap[16][16];
    
    uint8_t spriteCount;
    BitsySprite *sprites;
} Room;

extern void showDialog(char *s);

${mainGeneratedBody}


const uint8_t BUTTON_REPEAT_RATE = 8;

uint8_t currentLevel = 0;
uint8_t buttonDelay = 0;
uint8_t scrollY = 0;
uint8_t targetScrollY = 0;
bool needUpdate = true;
BitsySprite playerSprite;

void  (*currentDialog)() = NULL;

void drawTile(uint8_t tx, uint8_t ty, uint8_t tn) {
  arduboy.drawBitmap(tx * 8, ty * 8 - scrollY, images[tn], 8, 8, WHITE);
}

void drawSprite(BitsySprite *spr) {
  drawTile(spr->x, spr->y, spr->image);
}

bool tryMovingPlayer(int8_t dx, uint8_t dy) {
  // Calculate where the player will try to move to
  uint8_t x = playerSprite.x + dx;
  uint8_t y = playerSprite.y + dy;

  // Out of bounds  
  if (x > 15 || y > 15) {
    return false;
  }
  
  // Check if there are background tiles in the way
  uint8_t tn = pgm_read_byte(&rooms[currentLevel].tileMap[y][x]);
  if (tn) {
    return false;
  }
  
  // Check collision against the sprites
  for (uint8_t i = 0; i != rooms[currentLevel].spriteCount; i++) {
    BitsySprite *spr = rooms[currentLevel].sprites + i;
    if (spr->x == x && spr->y == y) {
      currentDialog = spr->dialog;      
      return true;
    }
  }
    
  // No obstacles found: the player can move.
  playerSprite.x = x;
  playerSprite.y = y;
  
  return true;
}

bool controlPlayer() {
  if (arduboy.pressed(UP_BUTTON)) {
    return tryMovingPlayer(0, -1);
  }
  if (arduboy.pressed(DOWN_BUTTON)) {
    return tryMovingPlayer(0, 1);
  }
  if (arduboy.pressed(LEFT_BUTTON)) {
    return tryMovingPlayer(-1, 0);
  }
  if (arduboy.pressed(RIGHT_BUTTON)) {
    return tryMovingPlayer(1, 0);
  }
  
  return false;
}

void waitNextFrame() {
    while (!arduboy.nextFrame()) arduboy.idle();
}

void showDialog(char *s) {
  arduboy.fillRect(0, 4, 127, 44, BLACK);
  
  arduboy.setTextWrap(true);
  arduboy.setCursor(0, 6);
  arduboy.print(s);
  arduboy.display();
  
  bool blinkState = true;
  
  while (arduboy.notPressed(A_BUTTON | B_BUTTON)) {
    waitNextFrame();
    
    if (arduboy.everyXFrames(30)) {
      arduboy.drawChar(120, 36, '\\x1F', blinkState ? BLACK : WHITE, blinkState ? WHITE : BLACK, 1);
      blinkState = !blinkState;
      arduboy.display();
    }
  }
  
  while (arduboy.pressed(A_BUTTON) || arduboy.pressed(B_BUTTON)) {
    waitNextFrame();
  }
}

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
  
  playerSprite = playerSpriteStart;
}

void loop() {
  // put your main code here, to run repeatedly:
  if (!arduboy.nextFrame()) return;
  
  // Wait between keypresses
  if (buttonDelay > 0) {
    buttonDelay--;
  } else {
    if (controlPlayer()) {
      buttonDelay = BUTTON_REPEAT_RATE;
      needUpdate = true;
    
      // Calculates scrolling
      if (playerSprite.y < 4) {
        targetScrollY = 0;
      } else {
        uint8_t scrollTY = playerSprite.y - 4;
        if (scrollTY > 8) scrollTY = 8;
        targetScrollY = scrollTY * 8;
      }
    }
  }
  
  // Scroll if necessary
  if (scrollY != targetScrollY) {
    if (scrollY < targetScrollY) {
      scrollY++;
    } else {
      scrollY--;
    }
    needUpdate = true;
  }

  // Draw the graphics
  if (needUpdate) {
    arduboy.clear();

    // Fill the background with the tiles
    for (uint8_t ty = 0; ty != 16; ty++) {
      for (uint8_t tx = 0; tx != 16; tx++) {
        uint8_t tn = pgm_read_byte(&rooms[currentLevel].tileMap[ty][tx]);
        drawTile(tx, ty, tn);
      }
    }
    
    // Draw the sprites on top of the background
    for (uint8_t i = 0; i != rooms[currentLevel].spriteCount; i++) {
      BitsySprite *spr = rooms[currentLevel].sprites + i;
      drawSprite(spr);
    }
    
    // Draw the player's sprite
    drawSprite(&playerSprite);
    
    arduboy.display();
    
    needUpdate = false;
  }
  
  if (currentDialog) {
    (*currentDialog)();
    currentDialog = NULL;
    needUpdate = true;
  }
  
}
`.trimStart();
}
