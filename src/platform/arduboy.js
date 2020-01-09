import {groupBy, fromPairs, trimStart} from 'lodash-es';

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
 * Generates a C constant declaration.
 */
const toConstantDeclaration = (name, type, value) => `const ${type} ${name} = ${value};`;

/**
 * Generates image information declaration.
 */
const toImageInfoDeclaration = ({name, frames, isWall}) => `
  // ${name}
  ${ Array(frames.length).fill(`{ ${isWall}, ${frames.length} }`).join(',\n  ') }
`.trim();

/** 
 * Generates a C constant containing all the images contained in imageInfos
 */
const toImageDeclaration = (name, imageInfos) => {
  const infoDeclaration = toConstantDeclaration('tileInfos[]', 'TileInfo PROGMEM', `{
  ${ imageInfos.map(toImageInfoDeclaration).join(',\n  ') }
}`);
  
  const content = imageInfos.map(({name, frames, index, offset}) => `
  // ${name}: index ${index}, offset ${offset}, ${frames.length} frame(s)
  ${frames.map(frame => `{ ${convertTile(frame)} }`).join(',\n  ')}`).join(',');
  
  return `${infoDeclaration}

const uint8_t PROGMEM ${name}[][8] = { 
${content} 
};`
}

const generateUnknownDialogCommand = command => `/* Unknown command: ${command.type} name=${command.name} mode=${command.mode} */`;

const generatePrintDialogCommand = command => `showDialog(F("${command.arguments[0].value}"));`;

const generateBlockDialogCommand = command => command.children
  .map(child => child.type === 'function'&& child.name === 'print' ? generatePrintDialogCommand(child) : generateUnknownDialogCommand(child)).join('\n  ');

/**
 * Generates a dialog function.
 */
const toDialogDeclaration = (prefix, name, dialog) => {
  const content = dialog.type === 'block' && dialog.mode === 'dialog' ?
    generateBlockDialogCommand(dialog) : generateUnknownDialogCommand(dialog);
  return `void ${prefix}_${name}() {
  ${content}  
}`;
}

/**
 * Generates dialog functions from the world object
 */
const toDialogsDeclaration = world => Object.entries(world.dialog).map(([name, dialog]) => toDialogDeclaration('dialog', name, dialog)).join('\n\n');

/**
 * Generates dialog functions from the world object
 */
const toEndingsDeclaration = world => Object.entries(world.ending).map(([name, dialog]) => toDialogDeclaration('ending', name, dialog)).join('\n\n');

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
  }, ${room.sprites.length}, room_${room.id}_sprites, ${room.exits.length}, room_${room.id}_exits, ${room.endings.length}, room_${room.id}_endings}
`;

/**
 * Generates a C constant from a sprite object.
 */
const toSpriteDeclaration = sprite => `{ ofs_${sprite.drw}, ${sprite.x}, ${sprite.y}${sprite.dlg ? `, dialog_${sprite.dlg}` : ''} }`;

/**
 * Generates a C array declaration from an array
 */
const toArrayDeclaration = elements => `{ ${elements.join(', ')} }`;

/**
 * Generates a C constant representing all the rooms contained in a room object.
 */
const toRoomsDeclaration = (name, roomInfos) => {
  const spriteDeclarations = roomInfos.map(room => toConstantDeclaration(`room_${room.id}_sprites[]`, 'BitsySprite PROGMEM', `{
  ${ room.sprites.map(toSpriteDeclaration).join(',\n  ') }
}`));
  
  const exitDeclarations = roomInfos.map(room => toConstantDeclaration(`room_${room.id}_exits[]`, 'Exit PROGMEM', `{
  ${ room.exits.map(({x, y, dest}) => toArrayDeclaration([x, y, dest.x, dest.y, dest.room])).join(',\n  ') }
}`));

  const endingDeclarations = roomInfos.map(room => toConstantDeclaration(`room_${room.id}_endings[]`, 'Ending PROGMEM', `{
  ${ room.endings.map(({x, y, id}) => toArrayDeclaration([x, y, `ending_${id}`])).join(',\n  ') }
}`));

  const roomsDeclaration = toConstantDeclaration(`${name}[]`, 'Room PROGMEM', `{
${ roomInfos.map(room => toRoomDeclaration(room)).join(',') }
}`);

  return [...spriteDeclarations, ...exitDeclarations, ...endingDeclarations, roomsDeclaration].join('\n\n');
}

/**
 * Generates an object containing various information about the images contained in the world object.
 */
const extractImageInfos = world => {
  const withBlank = [ ['BLANK', [ Array(8).fill(Array(8).fill(0)) ] ], ...Object.entries(world.images) ];
  const imageInfos = withBlank.map(([name, frames], index) => ({ name, frames, index }));
  
  const tilesByDrw = fromPairs(Object.values(world.tile).map(tile => [tile.drw, tile]));
  const withWalls = imageInfos.map(info => ({
    ...info, 
    isWall: !!(tilesByDrw[info.name] && tilesByDrw[info.name].isWall)
  }));
  
  const withOffsets = withWalls.reduce(({offset, results}, info) => ({
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
 * Takes the world object, and extracts extra information from it.
 */
const prepareWorldInformation = world => {
  const imageInfos = extractImageInfos(world);
  
  const imageOffsets = fromPairs(imageInfos.map(({name, offset}) => [name, offset]));
  const frameCount = imageInfos.reduce((total, info) => total + info.frames.length, 0);
  
  const roomInfos = extractRoomInfos(world, imageOffsets);
  const playerSpriteStart = Object.values(world.sprite).find(sprite => isPlayerSprite(sprite, world));
  
  return {world, imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart};
};

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object.
 */
export const convertWorld = world => {
  const {imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart} = prepareWorldInformation(world);
  
  const imageOffsetBody = toEnumDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`);
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toConstantDeclaration('gameTitle', 'String', `"${world.title}"`),
    toConstantDeclaration('playerSpriteStart', 'BitsySprite PROGMEM', toSpriteDeclaration(playerSpriteStart)),
    toDialogsDeclaration(world),
    toEndingsDeclaration(world),
    toRoomsDeclaration('rooms', roomInfos),
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');

  return trimStart(`
#include <Arduboy2.h>

Arduboy2 arduboy;

${imageOffsetBody}

typedef struct {
    ImageOffset image;
    uint8_t x, y;
    void  (*dialog)();
} BitsySprite;

typedef struct {
  bool isWall;
  uint8_t frameCount;
} TileInfo;

typedef struct {
  uint8_t origX, origY;
  uint8_t destX, destY;
  uint8_t destRoom;
} Exit;

typedef struct {
  uint8_t x, y;
  void  (*dialog)();
} Ending;

typedef struct Room {
    uint8_t tileMap[16][16];
    
    uint8_t spriteCount;
    BitsySprite *sprites;
    
    uint8_t exitCount;
    Exit *exits;
    
    uint8_t endingCount;
    Ending *endings;
} Room;

extern void showDialog(String s);

${mainGeneratedBody}


const uint8_t BUTTON_REPEAT_RATE = 8;

bool startingGame = false;
uint8_t currentLevel = 0;
uint8_t buttonDelay = 0;
uint8_t scrollY = 0;
uint8_t targetScrollY = 0;
bool needUpdate = true;
BitsySprite playerSprite;
uint16_t frameControl = 0;

void  (*currentDialog)() = NULL;
void  (*currentEnding)() = NULL;

void calculateRequiredScrolling() {
  if (playerSprite.y < 4) {
    targetScrollY = 0;
  } else {
    uint8_t scrollTY = playerSprite.y - 4;
    if (scrollTY > 8) scrollTY = 8;
    targetScrollY = scrollTY * 8;
  }
}

void drawTile(uint8_t tx, uint8_t ty, uint8_t tn) {
  uint8_t frameNumber = frameControl % pgm_read_byte(&tileInfos[tn].frameCount);
  arduboy.drawBitmap(tx * 8, ty * 8 - scrollY, images[tn + frameNumber], 8, 8, WHITE);
}

void drawRomSprite(BitsySprite *spr) {
  drawTile(pgm_read_byte(&spr->x), pgm_read_byte(&spr->y), pgm_read_byte(&spr->image));
}

void drawSprite(BitsySprite *spr) {
  drawTile(spr->x, spr->y, spr->image);
}

BitsySprite *fetchSprite(uint16_t spriteNumber) {
    // Basically, rooms[currentLevel].sprites + i
  return (BitsySprite *) (pgm_read_word(&rooms[currentLevel].sprites) + spriteNumber * sizeof(BitsySprite));
}

Exit *fetchExit(uint16_t exitNumber) {
    // Basically, rooms[currentLevel].exits + i
  return (Exit *) (pgm_read_word(&rooms[currentLevel].exits) + exitNumber * sizeof(Exit));
}

Ending *fetchEnding(uint16_t endingNumber) {
    // Basically, rooms[currentLevel].exits + i
  return (Ending *) (pgm_read_word(&rooms[currentLevel].endings) + endingNumber * sizeof(Ending));
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
  if (tn && pgm_read_byte(&tileInfos[tn].isWall)) {
    return false;
  }
  
  // Check collision against the sprites
  for (uint8_t i = 0; i != pgm_read_byte(&rooms[currentLevel].spriteCount); i++) {
    BitsySprite *spr = fetchSprite(i);
    if (pgm_read_byte(&spr->x) == x && pgm_read_byte(&spr->y) == y) {
      currentDialog = pgm_read_word(&spr->dialog);
      return true;
    }
  }
    
  // Check collision against the exits
  for (uint8_t i = 0; i != pgm_read_byte(&rooms[currentLevel].exitCount); i++) {
    Exit *ext = fetchExit(i);
    
    if (pgm_read_byte(&ext->origX) == x && pgm_read_byte(&ext->origY) == y) {
      playerSprite.x = pgm_read_byte(&ext->destX);
      playerSprite.y = pgm_read_byte(&ext->destY);
      currentLevel = pgm_read_byte(&ext->destRoom);
      
      calculateRequiredScrolling();    
      scrollY = targetScrollY;
      
      return true;
    }
  }
    
  // Check collision against the endings
  for (uint8_t i = 0; i != pgm_read_byte(&rooms[currentLevel].endingCount); i++) {
    Ending *edg = fetchEnding(i);    
    if (pgm_read_byte(&edg->x) == x && pgm_read_byte(&edg->y) == y) {
      currentEnding = pgm_read_word(&edg->dialog);
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

void showDialog(String s) {
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

void clearDisplay() {
  arduboy.clear();
  arduboy.display();
}

void startGame() {
  clearDisplay();
  showDialog(gameTitle);
  
  playerSprite = playerSpriteStart;
  currentLevel = 0;
  
  scrollY = 0;
  targetScrollY = 0;

  currentDialog = NULL;
  currentEnding = NULL;

  startingGame = false;
  needUpdate = true;
}

void endGame() {
  (*currentEnding)();
  currentEnding = NULL;
    
  startingGame = true;
  needUpdate = true;
}

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
  
  startingGame = true;
}

void loop() {
  // put your main code here, to run repeatedly:
  if (!arduboy.nextFrame()) return;

  // Display dialog if necessary
  if (startingGame) {
    startGame();
  }

  // Increment frame control for animations  
  if (arduboy.everyXFrames(30)) {
    frameControl++;
    needUpdate = true;
  }
  
  // Wait between keypresses
  if (buttonDelay > 0) {
    buttonDelay--;
  } else {
    if (controlPlayer()) {
      buttonDelay = BUTTON_REPEAT_RATE;
      needUpdate = true;

      calculateRequiredScrolling();    
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
    for (uint8_t i = 0; i != pgm_read_byte(&rooms[currentLevel].spriteCount); i++) {
      BitsySprite *spr = fetchSprite(i);
      drawRomSprite(spr);
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
  
  if (currentEnding) {
    endGame();
  }
  
}
`);
}

export const convertArduboy = code => {
  const world = parseWorld(code, {parseScripts: true}); 
  return convertWorld(world);
}
