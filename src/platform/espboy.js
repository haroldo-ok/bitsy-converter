import {flatten, chunk, trimStart} from 'lodash-es';

import {parseWorld} from 'bitsy-parser';

import {prepareWorldInformation, prepareForCaseInsensitive} from './world';
import {toConstantDeclaration, toMatrixDeclaration, toConstantArrayDeclaration, toDefineDeclaration, toDefinesDeclaration,
       toInitializedDeclaration, toInitializedArrayDeclaration, toArrayLiteral, toStringLiteral} from './c-generator';

/** 
 * Generates a image constant declaration from a bidimensional array. 
 * Assumes the array is 8x8.
 */
const convertTile = (name, tile) =>  {
	const foregroundColor = name.includes('SPR') ? 2 : 1;
	return chunk(flatten(tile), 2).map(pair => `0x${ pair.map(pixel => pixel * foregroundColor ).join('') }`).join(', ');
}

/**
 * Generates image information declaration.
 */
const toImageInfoDeclaration = ({name, frames, isWall}) => `
  // ${name}
  ${ Array(frames.length).fill(`${isWall}, ${frames.length}`).join(',\n  ') }
`.trim();

/** 
 * Generates a C constant containing all the images contained in imageInfos
 */
const toImageDeclaration = (name, imageInfos) => {
  const infoDeclaration = toInitializedDeclaration('tileInfos[]', 'char', `{
  ${ imageInfos.map(toImageInfoDeclaration).join(',\n  ') }
}`);
	
  const namedImageInfos = flatten(imageInfos.map(({name, frames}) => frames.map((frame, idx) => ({
	  frame, name: `image_${name}_${idx}`
  }))));
	
  const imageDeclarations = namedImageInfos.map(({name, frame}) => `char ${name}[] = { ${convertTile(name, frame)} };`);
  
  const content = namedImageInfos.map(({name}) => `  ${name}`).join(',\n  ');
  
  return `${infoDeclaration}

${imageDeclarations.join('\n')}

int ${name}[] = { 
  ${content} 
};`
}

const generateUnknownDialogCommand = command => `/* Unknown command: ${command.type} name=${command.name} mode=${command.mode} */`;

const generatePrintDialogCommand = command => `showDialog(${toStringLiteral(command.arguments[0].value)});`;

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
 * Generates a routing function for the dialog
 */
const toRoutingDialogDeclaration = (functionName, constantGenerator, functionNameGenerator, names) => `
void ${functionName}(int dlgNumber) {
  switch (dlgNumber) {
${ names.map(name => `
  case ${ constantGenerator(name) }:
    ${ functionNameGenerator(name) }();
    break;
`).join('')
}
  }
}
`;

/**
 * Generates dialog ID constants from the world object
 */
const toDialogIdConstantsDeclaration = world => Object.keys(world.dialog).map((name, idx) => toDefineDeclaration(`DIALOG_ID_${name}`, idx + 1)).join('\n');

/**
 * Generates dialog functions from the world object
 */
const toDialogsDeclaration = world => Object.entries(world.dialog).map(([name, dialog]) => toDialogDeclaration('dialog', name, dialog)).join('\n\n');

/**
 * Generates main dialog function from the world object
 */
const toMainDialogDeclaration = world => toRoutingDialogDeclaration('showChosenDialog', name => `DIALOG_ID_${name}`, name => `dialog_${name}`, Object.keys(world.dialog));

/**
 * Generates ending ID constants from the world object
 */
const toEndingIdConstantsDeclaration = world => Object.keys(world.ending).map((name, idx) => toDefineDeclaration(`ENDING_ID_${name}`, idx + 1)).join('\n');

/**
 * Generates ending functions from the world object
 */
const toEndingsDeclaration = world => Object.entries(world.ending).map(([name, dialog]) => toDialogDeclaration('ending', name, dialog)).join('\n\n');

/**
 * Generates main ending function from the world object
 */
const toMainEndingDeclaration = world => toRoutingDialogDeclaration('showChosenEnding', name => `ENDING_ID_${name}`, name => `ending_${name}`, Object.keys(world.ending));

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

const toSpriteInternalDeclaration = sprite => `  ofs_${sprite.drw}, ${sprite.x}, ${sprite.y}, ${sprite.dlg ? `dialog_${sprite.dlg}` : '0'}`;

/**
 * Generates a constant array declaration, or '{{0}}' if empty.
 */
const toConstantArrayDeclarationOrEmpty = (name, elementType, elements) => elements && elements.length ?
  toConstantArrayDeclaration(name, elementType, elements) : 
  toConstantDeclaration(`${name}[]`, elementType, '{{0}}');
      

/**
 * Generates a C constant representing all the rooms contained in a room object.
 */
const toRoomsDeclaration = (name, roomInfos) => {
  const spriteDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}_sprites`, 'int', room.sprites.map(toSpriteInternalDeclaration)));
  
  const exitDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}_exits`, 'char', 
    room.exits.map( ({x, y, dest}) => [x, y, dest.x, dest.y, dest.room].join(', ') )
  ));

  const endingDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}_endings`, 'char',
    room.endings.map(({x, y, id}) => [x, y, `ENDING_ID_${id}`].join(', ') )
  ));

  const roomMapDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}`, 'char',
    room.tilemap.map(row => row.join(', ') )
  ));

  const roomsDeclaration = toInitializedArrayDeclaration(
    'rooms', 'int',
    roomInfos.map(room => `room_${room.id}, ${room.sprites.length}, room_${room.id}_sprites, ${room.exits.length}, room_${room.id}_exits, ${room.endings.length}, room_${room.id}_endings`)
  );

  return [...spriteDeclarations, ...exitDeclarations, ...endingDeclarations, ...roomMapDeclarations, roomsDeclaration].join('\n\n');
}

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object. 
 */
export const convertWorld = world => {
  const caseInsensitiveWorld = prepareForCaseInsensitive(world);
  const {imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart} = prepareWorldInformation(caseInsensitiveWorld);
  
  const definesBody = [
	  toDefinesDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`),
	  toDialogIdConstantsDeclaration(caseInsensitiveWorld),
	  toEndingIdConstantsDeclaration(caseInsensitiveWorld)
  ].join('\n\n');
	
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toConstantDeclaration('gameTitle[]', 'char', toStringLiteral(world.title)),
    toConstantDeclaration('playerSpriteStart[]', 'int', toSpriteDeclaration(playerSpriteStart)),
    toRoomsDeclaration('rooms', roomInfos),
  	toImageDeclaration('images', imageInfos),
  ].join('\n\n');
	
  const dialogFunctionsBody = [
    toDialogsDeclaration(world),
    toMainDialogDeclaration(world),
    toEndingsDeclaration(world),
    toMainEndingDeclaration(world)
  ];	 
	
  return trimStart(`
/*settings*{"name":"Your game's title here","author":"Bitsy-Converter","image":[240,240,240,240,240,240,240,240,240,240,240,240,0,0,0,0,0,0,0,0,0,0,0,15,240,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,8,0,0,15,240,0,0,0,0,0,0,0,8,0,0,0,0,0,153,153,153,153,153,153,152,0,0,159,240,9,25,25,17,17,17,17,24,168,168,144,0,241,145,145,17,28,204,193,24,136,136,159,240,15,17,17,255,17,17,17,24,168,168,144,0,0,255,255,255,255,255,255,250,0,0,159,240,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,10,0,0,15,240,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,240,0,0,0,0,0,0,0,0,0,0,0,15,15,15,15,15,15,15,15,15,15,15,15]}*/

#define false 0
#define true 1

${definesBody}
${mainGeneratedBody}

int backgroundMap[441];

char startingGame = false;
int currentLevel = 0;
char needUpdate = true;
int playerSprite[SPRITE_REC_SIZE];
int frameControl = 0;
int frameDelay = 0;
 
int currentDialog = 0;
int currentEnding = 0;

void delay(int t){
  settimer(0, t);
  while(gettimer(0) != 0){};
}

void init(){
  setbgcolor(0);
  setcolor(9);
  clearscreen();
  setimagesize(1);

  loadtile(backgroundMap, 8, 8, 16, 16);

}

int calcRoomPointer() {
  return currentLevel * ROOM_REC_SIZE;
}

int imageNumberForTile(char tn) {
  int tn, p;
  char frameCount;

  p = tn * TILE_INFO_REC_SIZE;
  frameCount = tileInfos[p + TILE_INFO_OFS_FRAME_COUNT];

  return images[tn + frameControl % frameCount];
}

void drawSprite(char targetNum, char srcIndex, int sprite[]) {
  int p = srcIndex * SPRITE_REC_SIZE;
  getsprite(targetNum, imageNumberForTile(sprite[p + SPRITE_OFS_TILE]));
  spritesetvalue(targetNum, S_WIDTH, 8);
  spritesetvalue(targetNum, S_HEIGHT,8);
  putsprite(targetNum, sprite[p + SPRITE_OFS_X] * 8, sprite[p + SPRITE_OFS_Y] * 8);
}

char checkRoomTilesCollision(int playerX, int playerY, char map[]) {
  int p;

  char tn = map[playerY * 16 + playerX];
  if (!tn) {
    return false;
  }

  p = tn * TILE_INFO_REC_SIZE;
  return tileInfos[p + TILE_INFO_OFS_IS_WALL];
}

char checkSpritesCollision(int playerX, int playerY, int roomSprites[], int spriteCount) { 
  int p = 0;
  char i;

  for (i = 0; i < spriteCount; i++) {
    if (playerX == roomSprites[p + SPRITE_OFS_X] && playerY == roomSprites[p + SPRITE_OFS_Y]) {      
      currentDialog = roomSprites[p + SPRITE_OFS_DLG];
      return true;
    }
    p += SPRITE_REC_SIZE;
  }

  return false;
}
	
char checkExitsCollision(int playerX, int playerY, char roomExits[], int exitCount) { 
  int p = 0;
  char i;

  for (i = 0; i < exitCount; i++) {
    if (playerX == roomExits[p + TILE_EXIT_OFS_ORIG_X] && playerY == roomExits[p + TILE_EXIT_OFS_ORIG_Y]) {      
      playerSprite[SPRITE_OFS_X] = roomExits[p + TILE_EXIT_OFS_DEST_X];
      playerSprite[SPRITE_OFS_Y] = roomExits[p + TILE_EXIT_OFS_DEST_Y];
      currentLevel = roomExits[p + TILE_EXIT_OFS_DEST_ROOM];
      needUpdate = true;

      return true;
    }
    p += TILE_EXIT_REC_SIZE;
  }

  return false;
}
	
char checkEndingsCollision(int playerX, int playerY, char roomEndings[], int endingCount) { 
  int p = 0;
  char i;

  for (i = 0; i < endingCount; i++) {
   if (playerX == roomEndings[p + ENDING_OFS_X] && playerY == roomEndings[p + ENDING_OFS_Y]) {      
      currentEnding = roomEndings[p + ENDING_OFS_DLG];
      return true;
    }
    p += ENDING_REC_SIZE;
  }

  return false;
}

char tryMovingPlayer(int dx, int dy) {
  // Calculate where the player will try to move to
  int x = playerSprite[SPRITE_OFS_X];
  int y = playerSprite[SPRITE_OFS_Y];

  int roomP = calcRoomPointer();

  x += dx;
  y += dy;

  // Out of bounds  
  if (x < 0 || x > 15 || y < 0 || y > 15) {
    return false;
  }

  // Check if there are background tiles in the way
  if (checkRoomTilesCollision(x, y, rooms[roomP + ROOM_OFS_MAP])) {
    return false;
  }

  // Check collision against the sprites
  if (checkSpritesCollision(x, y, rooms[roomP + ROOM_OFS_SPR_DATA], rooms[roomP + ROOM_OFS_SPR_COUNT])) {
    return true;
  }
  
  // Check collision against the exits
  if (checkExitsCollision(x, y, rooms[roomP + ROOM_OFS_EXIT_DATA], rooms[roomP + ROOM_OFS_EXIT_COUNT])) {
    return true;
  }

  // Check collision against the endings
  if (checkEndingsCollision(x, y, rooms[roomP + ROOM_OFS_END_DATA], rooms[roomP + ROOM_OFS_END_COUNT])) {
    return true;
  }

  // No obstacles found: the player can move.
  playerSprite[SPRITE_OFS_X] = x;
  playerSprite[SPRITE_OFS_Y] = y;

  needUpdate = true;
  return true;
}

char controlPlayer() {
  char key = getkey();
	
  if (key & KEY_UP) {
    return tryMovingPlayer(0, -1);
  }
  if (key & KEY_DOWN) {
    return tryMovingPlayer(0, 1);
  }
  if (key & KEY_LEFT) {
    return tryMovingPlayer(-1, 0);
  }
  if (key & KEY_RIGHT) {
    return tryMovingPlayer(1, 0);
  }
  
  return false;
}

char drawRoom(char map[]) {
  for (int i = 0; i != 256; i++) {
    backgroundMap[i] = imageNumberForTile(map[i]);
  }
}

void hideSpritesAfter(int startIndex) {
  for (int i = startIndex + 1; i < 32; i++) {
    putsprite(i, 192, 192);
  }
}

void drawSprites(int roomSprites[], int spriteCount) { 
  int i;
	
  drawSprite(1, 0, playerSprite);
  
  for (i = 0; i < spriteCount; i++) {
    drawSprite(i + 2, i, roomSprites);
  }

  hideSpritesAfter(spriteCount + 1);
}

/* For some reason, using "char s[]" as a parameter makes "puts(s)" print gibberish. */
void showDialog(int s) {
  hideSpritesAfter(0);
	
  char blink = false;
  char blinkDelay = 0;

  setColor(11):
  fillRect(4,4,124, 68);

  setBgColor(11);
  setColor(7):
  gotoXY(1, 1);
  puts(s);

  // Blink cursor until player presses a button
  while (!(getkey() & (KEY_A|KEY_B))) {
    gotoXY(19, 7);
    setColor(blink ? 7 : 11):
    puts("_");
    delay(1);

    if (blinkDelay) {
      blinkDelay--;
    } else {
      blink = !blink;
      blinkDelay = 15;
    }
  }

  while (getkey()) {}
}

${dialogFunctionsBody}

void startGame() { 
  int i;
	
  clearscreen();
  showDialog(gameTitle);

  for (i = 0; i != SPRITE_REC_SIZE; i++) {
    playerSprite[i] = playerSpriteStart[i];
  }

  frameControl = 0;
  frameDelay = 0;
   
  currentLevel = 0;
  
  currentDialog = 0;
  currentEnding = 0;

  startingGame = false;
  needUpdate = true;
}

void endGame() {
  clearscreen();
  showChosenEnding(currentEnding);
  currentEnding = 0;
    
  startingGame = true;
  needUpdate = true;
}

void main(){
  int roomP;
	
  init();

  startingGame = true;

  for(;;) {
    // Display title screen if necessary
    if (startingGame) {
      startGame();
    }

    // Increment frame control for animations  
    if (frameDelay) {
      frameDelay--;
    } else {
      frameControl = (frameControl + 1) % 0x7FFF;
      frameDelay = 8;
      needUpdate = true;
    }

    controlPlayer();

    if (needUpdate) {
      roomP = calcRoomPointer(); 

      setBgColor(0);
      clearscreen();

      drawRoom(rooms[roomP + ROOM_OFS_MAP]);
      drawtile(0, 0);

      drawSprites(rooms[roomP + ROOM_OFS_SPR_DATA], rooms[roomP + ROOM_OFS_SPR_COUNT]);

      needUpdate = false;
    }

    if (currentDialog) {
      showChosenDialog(currentDialog);
      currentDialog = 0;
      needUpdate = true;
    }

    if (currentEnding) {
      showChosenEnding(currentEnding);
      currentEnding = 0;
      startingGame = true;
      needUpdate = true;
    }

    delayredraw();    
  }

}
`);
}

export const convertESPBoy = code => {
  const world = parseWorld(code, {parseScripts: true}); 
  return convertWorld(world);
}
