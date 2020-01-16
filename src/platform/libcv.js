import {trimStart} from 'lodash-es';

import {parseWorld} from 'bitsy-parser';

import {prepareWorldInformation} from './world';
import {toConstantDeclaration, toMatrixDeclaration, toConstantArrayDeclaration, toEnumDeclaration,
       toArrayLiteral, toStringLiteral} from './c-generator';

/** 
 * Returns a transposed version of a bidimensional array. 
 */
const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

/**
 * Converts an array of bits into a number
 */
const parseBinary = bits => parseInt(bits.join(''), 2);

/**
 * Converts a number into its hex representation
 */
const toHex = n => n.toString(16).toUpperCase();

/**
 * Converts a byte into its hex representation, with padding.
 */
const toHexByte = n => toHex(n).padStart(2, '0');

/** 
 * Receives an array containing one binary number per element, and turns it into a 
 * string with the format Bnnnn.
 */
const toBinaryConst = a => `B${a.join('')}`;

/** 
 * Generates a image constant declaration from a bidimensional array. 
 * Assumes the array is 8x8.
 */
const convertTile = tile => tile.map(row => `0x${toHexByte(parseBinary(row))}`).join(', ');

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
  const infoDeclaration = toConstantDeclaration('tileInfos[]', 'TileInfo', `{
  ${ imageInfos.map(toImageInfoDeclaration).join(',\n  ') }
}`);
  
  const content = imageInfos.map(({name, frames, index, offset}) => `
  // ${name}: index ${index}, offset ${offset}, ${frames.length} frame(s)
  ${frames.map(frame => `{ ${convertTile(frame)} }`).join(',\n  ')}`).join(',');
  
  return `${infoDeclaration}

const uint8_t ${name}[][8] = { 
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
 * Generates dialog functions from the world object
 */
const toDialogsDeclaration = world => Object.entries(world.dialog).map(([name, dialog]) => toDialogDeclaration('dialog', name, dialog)).join('\n\n');

/**
 * Generates dialog functions from the world object
 */
const toEndingsDeclaration = world => Object.entries(world.ending).map(([name, dialog]) => toDialogDeclaration('ending', name, dialog)).join('\n\n');

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
 * Generates a constant array declaration, or '{{0}}' if empty.
 */
const toConstantArrayDeclarationOrEmpty = (name, elementType, elements) => elements && elements.length ?
  toConstantArrayDeclaration(name, elementType, elements) : 
  toConstantDeclaration(`${name}[]`, elementType, '{{0}}');
      

/**
 * Generates a C constant representing all the rooms contained in a room object.
 */
const toRoomsDeclaration = (name, roomInfos) => {
  const spriteDeclarations = roomInfos.map(room => toConstantArrayDeclarationOrEmpty(
    `room_${room.id}_sprites`, 'BitsySprite', room.sprites.map(toSpriteDeclaration)));
  
  const exitDeclarations = roomInfos.map(room => toConstantArrayDeclarationOrEmpty(
    `room_${room.id}_exits`, 'Exit', 
    room.exits.map( ({x, y, dest}) => toArrayLiteral([x, y, dest.x, dest.y, dest.room]) )
  ));

  const endingDeclarations = roomInfos.map(room => toConstantArrayDeclarationOrEmpty(
    `room_${room.id}_endings`, 'Ending',
    room.endings.map(({x, y, id}) => toArrayLiteral([x, y, `ending_${id}`]))
  ));

  const roomsDeclaration = toConstantDeclaration(`${name}[]`, 'Room', `{
${ roomInfos.map(room => toRoomDeclaration(room)).join(',') }
}`);

  return [...spriteDeclarations, ...exitDeclarations, ...endingDeclarations, roomsDeclaration].join('\n\n');
}

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object.
 */
export const convertWorld = world => {
  const {imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart} = prepareWorldInformation(world);
  
  const imageOffsetBody = toEnumDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`);
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toConstantDeclaration('gameTitle[]', 'char', toStringLiteral(world.title)),
    toConstantDeclaration('playerSpriteStart', 'BitsySprite', toSpriteDeclaration(playerSpriteStart)),
    toDialogsDeclaration(world),
    toEndingsDeclaration(world),
    toRoomsDeclaration('rooms', roomInfos),
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');

  return trimStart(`
// Converted to SDCC + LibCV by Bitsy-Converter

#include <stdlib.h>
#include <string.h>
#include <cv.h>
#include <cvu.h>

#define BGCOL CV_COLOR_BLUE

#define ROOM_COLS 16
#define ROOM_ROWS 16
#define ROOM_X_OFS ((COLS - ROOM_COLS) >> 1)
#define ROOM_Y_OFS ((ROWS - ROOM_ROWS) >> 1)
#define FIRST_TILE 128

#define DLG_COLS 28
#define DLG_X_OFS ((COLS - DLG_COLS) >> 1)
#define DLG_Y_OFS 2

${imageOffsetBody}


typedef struct {
    uint8_t image;
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

void showDialog(char *s);


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
uint8_t frameDelay = 0;

void  (*currentDialog)() = NULL;
void  (*currentEnding)() = NULL;



/* VRAM map
   0x0000 - 0x17ff character pattern table
   0x1800 - 0x1aff image table
   0x2000 - 0x37ff color table
   0x3800 - 0x3bff sprite pattern table
   0x3c00 - 0x3fff sprite attribute table
*/
 
#define PATTERN		((const cv_vmemp)0x0000)
#define IMAGE		((const cv_vmemp)0x1800)
#define COLOR		((const cv_vmemp)0x2000)
#define SPRITE_PATTERNS ((const cv_vmemp)0x3800)
#define SPRITES		((const cv_vmemp)0x3c00)

#ifndef COLS
#define COLS 32
#endif

#ifndef ROWS
#define ROWS 24
#endif

#define wait_vsync() __asm__("halt")

const uint8_t font_bitmap[] = {
// Character ' '
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00, // 32
0x10,0x38,0x38,0x10,0x10,0x00,0x10,0x00, // 33
0x6c,0x6c,0x48,0x00,0x00,0x00,0x00,0x00, // 34
0x00,0x28,0x7c,0x28,0x28,0x7c,0x28,0x00, // 35
0x20,0x38,0x40,0x30,0x08,0x70,0x10,0x00, // 36
0x64,0x64,0x08,0x10,0x20,0x4c,0x4c,0x00, // 37
0x20,0x50,0x50,0x20,0x54,0x48,0x34,0x00, // 38
0x30,0x30,0x20,0x00,0x00,0x00,0x00,0x00, // 39
0x10,0x20,0x20,0x20,0x20,0x20,0x10,0x00, // 40
0x20,0x10,0x10,0x10,0x10,0x10,0x20,0x00, // 41
0x00,0x28,0x38,0x7c,0x38,0x28,0x00,0x00, // 42
0x00,0x10,0x10,0x7c,0x10,0x10,0x00,0x00, // 43
0x00,0x00,0x00,0x00,0x00,0x30,0x30,0x20, // 44
0x00,0x00,0x00,0x7c,0x00,0x00,0x00,0x00, // 45
0x00,0x00,0x00,0x00,0x00,0x30,0x30,0x00, // 46
0x00,0x04,0x08,0x10,0x20,0x40,0x00,0x00, // 47
// Character 0
0x38,0x44,0x4c,0x54,0x64,0x44,0x38,0x00, // 48
0x10,0x30,0x10,0x10,0x10,0x10,0x38,0x00, // 49
0x38,0x44,0x04,0x18,0x20,0x40,0x7c,0x00, // 50
0x38,0x44,0x04,0x38,0x04,0x44,0x38,0x00, // 51
0x08,0x18,0x28,0x48,0x7c,0x08,0x08,0x00, // 52
0x7c,0x40,0x40,0x78,0x04,0x44,0x38,0x00, // 53
0x18,0x20,0x40,0x78,0x44,0x44,0x38,0x00, // 54
0x7c,0x04,0x08,0x10,0x20,0x20,0x20,0x00, // 55
0x38,0x44,0x44,0x38,0x44,0x44,0x38,0x00, // 56
0x38,0x44,0x44,0x3c,0x04,0x08,0x30,0x00, // 57
0x00,0x00,0x30,0x30,0x00,0x30,0x30,0x00, // 58
0x00,0x00,0x30,0x30,0x00,0x30,0x30,0x20, // 59
0x08,0x10,0x20,0x40,0x20,0x10,0x08,0x00, // 60
0x00,0x00,0x7c,0x00,0x00,0x7c,0x00,0x00, // 61
0x20,0x10,0x08,0x04,0x08,0x10,0x20,0x00, // 62
0x38,0x44,0x04,0x18,0x10,0x00,0x10,0x00, // 63
0x38,0x44,0x5c,0x54,0x5c,0x40,0x38,0x00, // 64
// Character A
0x38,0x44,0x44,0x44,0x7c,0x44,0x44,0x00, // 65
0x78,0x44,0x44,0x78,0x44,0x44,0x78,0x00, // 66
0x38,0x44,0x40,0x40,0x40,0x44,0x38,0x00, // 67
0x78,0x44,0x44,0x44,0x44,0x44,0x78,0x00, // 68
0x7c,0x40,0x40,0x78,0x40,0x40,0x7c,0x00, // 69
0x7c,0x40,0x40,0x78,0x40,0x40,0x40,0x00, // 70
0x38,0x44,0x40,0x5c,0x44,0x44,0x3c,0x00, // 71
0x44,0x44,0x44,0x7c,0x44,0x44,0x44,0x00, // 72
0x38,0x10,0x10,0x10,0x10,0x10,0x38,0x00, // 73
0x04,0x04,0x04,0x04,0x44,0x44,0x38,0x00, // 74
0x44,0x48,0x50,0x60,0x50,0x48,0x44,0x00, // 75
0x40,0x40,0x40,0x40,0x40,0x40,0x7c,0x00, // 76
0x44,0x6c,0x54,0x44,0x44,0x44,0x44,0x00, // 77
0x44,0x64,0x54,0x4c,0x44,0x44,0x44,0x00, // 78
0x38,0x44,0x44,0x44,0x44,0x44,0x38,0x00, // 79
0x78,0x44,0x44,0x78,0x40,0x40,0x40,0x00, // 80
0x38,0x44,0x44,0x44,0x54,0x48,0x34,0x00, // 81
0x78,0x44,0x44,0x78,0x48,0x44,0x44,0x00, // 82
0x38,0x44,0x40,0x38,0x04,0x44,0x38,0x00, // 83
0x7c,0x10,0x10,0x10,0x10,0x10,0x10,0x00, // 84
0x44,0x44,0x44,0x44,0x44,0x44,0x38,0x00, // 85
0x44,0x44,0x44,0x44,0x44,0x28,0x10,0x00, // 86
0x44,0x44,0x54,0x54,0x54,0x54,0x28,0x00, // 87
0x44,0x44,0x28,0x10,0x28,0x44,0x44,0x00, // 88
0x44,0x44,0x44,0x28,0x10,0x10,0x10,0x00, // 89
0x78,0x08,0x10,0x20,0x40,0x40,0x78,0x00, // 90
0x38,0x20,0x20,0x20,0x20,0x20,0x38,0x00, // 91
0x00,0x40,0x20,0x10,0x08,0x04,0x00,0x00, // 92
0x38,0x08,0x08,0x08,0x08,0x08,0x38,0x00, // 93
0x10,0x28,0x44,0x00,0x00,0x00,0x00,0x00, // 94
0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xfc, // 95
0x30,0x30,0x10,0x00,0x00,0x00,0x00,0x00, // 96
0x00,0x00,0x38,0x04,0x3c,0x44,0x3c,0x00, // 97
0x40,0x40,0x78,0x44,0x44,0x44,0x78,0x00, // 98
0x00,0x00,0x38,0x44,0x40,0x44,0x38,0x00, // 99
0x04,0x04,0x3c,0x44,0x44,0x44,0x3c,0x00, // 100
0x00,0x00,0x38,0x44,0x78,0x40,0x38,0x00, // 101
0x18,0x20,0x20,0x78,0x20,0x20,0x20,0x00, // 102
0x00,0x00,0x3c,0x44,0x44,0x3c,0x04,0x38, // 103
0x40,0x40,0x70,0x48,0x48,0x48,0x48,0x00, // 104
0x10,0x00,0x10,0x10,0x10,0x10,0x18,0x00, // 105
0x08,0x00,0x18,0x08,0x08,0x08,0x48,0x30, // 106
0x40,0x40,0x48,0x50,0x60,0x50,0x48,0x00, // 107
0x10,0x10,0x10,0x10,0x10,0x10,0x18,0x00, // 108
0x00,0x00,0x68,0x54,0x54,0x44,0x44,0x00, // 109
0x00,0x00,0x70,0x48,0x48,0x48,0x48,0x00, // 110
0x00,0x00,0x38,0x44,0x44,0x44,0x38,0x00, // 111
0x00,0x00,0x78,0x44,0x44,0x44,0x78,0x40, // 112
0x00,0x00,0x3c,0x44,0x44,0x44,0x3c,0x04, // 113
0x00,0x00,0x58,0x24,0x20,0x20,0x70,0x00, // 114
0x00,0x00,0x38,0x40,0x38,0x04,0x38,0x00, // 115
0x00,0x20,0x78,0x20,0x20,0x28,0x10,0x00, // 116
0x00,0x00,0x48,0x48,0x48,0x58,0x28,0x00, // 117
0x00,0x00,0x44,0x44,0x44,0x28,0x10,0x00, // 118
0x00,0x00,0x44,0x44,0x54,0x7c,0x28,0x00, // 119
0x00,0x00,0x48,0x48,0x30,0x48,0x48,0x00, // 120
0x00,0x00,0x48,0x48,0x48,0x38,0x10,0x60, // 121
0x00,0x00,0x78,0x08,0x30,0x40,0x78,0x00, // 122
0x18,0x20,0x20,0x60,0x20,0x20,0x18,0x00, // 123
0x10,0x10,0x10,0x00,0x10,0x10,0x10,0x00, // 124
0x30,0x08,0x08,0x0c,0x08,0x08,0x30,0x00, // 125
0x28,0x50,0x00,0x00,0x00,0x00,0x00,0x00, // 126
0x10,0x38,0x6c,0x44,0x44,0x7c,0x00,0x00, // 127
};
 
volatile uint_fast8_t vint_counter;

void vint_handler(void) {
  vint_counter++;
}

void vdp_setup() {
  cv_set_screen_active(false);
  cv_set_screen_mode(CV_SCREENMODE_STANDARD);
  cv_set_image_table(IMAGE);
  cv_set_character_pattern_t(PATTERN);
  cv_set_color_table(COLOR);
  cv_set_sprite_pattern_table(SPRITE_PATTERNS);
  cv_set_sprite_attribute_table(SPRITES);
  cv_set_sprite_big(true);
}

void setupGraphics() {
#ifndef CV_MSX
  cvu_memtovmemcpy(PATTERN + 8*' ', font_bitmap, 0x800);
#endif

#ifndef CV_MSX
  cvu_vmemset(COLOR, 0x30|BGCOL, 8); // set color for chars 0-63
  cvu_vmemset(COLOR+8, 0x0|BGCOL, 32-8); // set chars 63-255
  cvu_vmemset(COLOR+16, 0xb0|BGCOL, 1); // set chars 128-128+8
#endif

  // Prepare blank tile 0
  cvu_memtovmemcpy(PATTERN, images[0], 8);
  
  // Load the images as chars
  cvu_memtovmemcpy(PATTERN+8*FIRST_TILE, images[0], 8 * FRAME_COUNT);
  cvu_memtovmemcpy(SPRITE_PATTERNS, images[0], 8 * FRAME_COUNT);
}

uint8_t frameNumber(uint8_t tn) {
  uint8_t frameCount = tileInfos[tn].frameCount;
  return frameCount > 1 ? frameControl % frameCount : 0;
}

void drawSprite(uint8_t sprNumber, BitsySprite *spr) {
  struct cvu_sprite sprite;

  cvu_set_sprite_x(&sprite, (spr->x + ROOM_X_OFS) * 8);
  cvu_set_sprite_y(&sprite, (spr->y + ROOM_Y_OFS) * 8);
  cvu_set_sprite_color(&sprite, CV_COLOR_WHITE);
  sprite.name = spr->image + frameNumber(spr->image);
  cvu_set_sprite(SPRITES, sprNumber, &sprite); 
}

void finishSpriteList(uint8_t sprNumber) {
  struct cvu_sprite sprite;
  // If Y is 208, that sprite and all following sprites in the table are not  displayed.
  sprite.y = 208;
  cvu_set_sprite(SPRITES, sprNumber, &sprite); 
}

void clearDisplay() {
  cvu_vmemset(IMAGE, 0, COLS * ROWS);
  finishSpriteList(0);
}

void drawBackground() {
  char buf[COLS];

  for (uint16_t i = 0; i != ROOM_ROWS; i++) {
    for (uint8_t j = 0; j != ROOM_COLS; j++) {
      uint8_t tileNumber = rooms[currentLevel].tileMap[i][j];
      buf[j] = tileNumber + frameNumber(tileNumber) + FIRST_TILE;
    }
    cvu_memtovmemcpy(IMAGE + ROOM_X_OFS + COLS * (ROOM_Y_OFS + i), buf, ROOM_COLS);
  }
}

void drawSprites() { 
  uint8_t sprNumber = 0;
  drawSprite(sprNumber++, &playerSprite);
  
  for (uint8_t i = 0; i < rooms[currentLevel].spriteCount; i++) { 
    BitsySprite *spr = &rooms[currentLevel].sprites[i]; 
    drawSprite(sprNumber++, spr);
  }
  
  finishSpriteList(sprNumber);
}

void showDialog(char *s) {
  struct cv_controller_state ctrl;
  char buf[DLG_COLS];
  uint16_t vaddr = IMAGE + DLG_X_OFS + COLS * DLG_Y_OFS; 
  uint8_t counter = 0;  
 
  // Draw text
  for (char *p = s; *p; vaddr += COLS) {
    for (uint8_t j = 0; j != DLG_COLS; j++) {
      buf[j] = *p;
      if (*p) {
        p++;
      }
    }
    cvu_memtovmemcpy(vaddr, buf, DLG_COLS);
  }
  
  // Wait button press
  do {
    wait_vsync();
    cv_get_controller_state(&ctrl, 0); 
    cvu_vmemset(vaddr + DLG_COLS - 1, counter & 0x20 ? ' ' : '_', 1);
    counter++;
  } while (!(ctrl.joystick & (CV_FIRE_0 | CV_FIRE_1)));
  
  // Wait button release
  do {
    wait_vsync();
    cv_get_controller_state(&ctrl, 0); 
  } while (ctrl.joystick & (CV_FIRE_0 | CV_FIRE_1));
  
  // Clear screen
  clearDisplay();
  needUpdate = true;
}

bool tryMovingPlayer(int8_t dx, uint8_t dy) {
  // Calculate where the player will try to move to
  uint8_t x = playerSprite.x + dx;
  uint8_t y = playerSprite.y + dy;
  uint8_t tn;

  // Out of bounds  
  if (x > 15 || y > 15) {
    return false;
  }

  // Check if there are background tiles in the way
  tn = rooms[currentLevel].tileMap[y][x];
  if (tn && tileInfos[tn].isWall) {
    return false;
  }
  
  // Check collision against the sprites
  for (uint8_t i = 0; i != rooms[currentLevel].spriteCount; i++) {
    BitsySprite *spr = &rooms[currentLevel].sprites[i];
    if (spr->x == x && spr->y == y) {
      currentDialog = spr->dialog;
      return true;
    }
  }
    
  // Check collision against the exits
  for (uint8_t i = 0; i != rooms[currentLevel].exitCount; i++) {
    Exit *ext = &rooms[currentLevel].exits[i];
    
    if (ext->origX == x && ext->origY == y) {
      playerSprite.x = ext->destX;
      playerSprite.y = ext->destY;
      currentLevel = ext->destRoom; 
      
      return true;
    }
  }
    
  // Check collision against the endings
  for (uint8_t i = 0; i != rooms[currentLevel].endingCount; i++) {
    Ending *edg = &rooms[currentLevel].endings[i];
    if (edg->x == x && edg->y == y) {
      currentEnding = edg->dialog; 
      return true;
    }
  }

  // No obstacles found: the player can move.
  playerSprite.x = x;
  playerSprite.y = y;
  
  return true;
}

bool controlPlayer() {
  struct cv_controller_state ctrl;
  cv_get_controller_state(&ctrl, 0); 
  
  if (ctrl.joystick & CV_UP) {
    return tryMovingPlayer(0, -1);
  }
  if (ctrl.joystick & CV_DOWN) {
    return tryMovingPlayer(0, 1);
  }
  if (ctrl.joystick & CV_LEFT) {
    return tryMovingPlayer(-1, 0);
  }
  if (ctrl.joystick & CV_RIGHT) {
    return tryMovingPlayer(1, 0);
  }
  
  return false;
}

void startGame() { 
  clearDisplay();
  showDialog(gameTitle);

  playerSprite.image = playerSpriteStart.image;
  playerSprite.x = playerSpriteStart.x;
  playerSprite.y = playerSpriteStart.y;
  
  frameControl = 0;
  frameDelay = 0;
   
  currentLevel = 0;
  
  scrollY = 0;
  targetScrollY = 0;

  currentDialog = NULL;
  currentEnding = NULL;

  startingGame = false;
  needUpdate = true;
}

void endGame() {
  clearDisplay();
  (*currentEnding)();
  currentEnding = NULL;
    
  startingGame = true;
  needUpdate = true;
}

void main() {
  vdp_setup();
  cv_set_sprite_big(false);

  setupGraphics();
  cv_set_screen_active(true);
  cv_set_vint_handler(&vint_handler);  
  
  startingGame = true;

  for (;;) { 
    wait_vsync();
    
    // Display title screen if necessary
    if (startingGame) {
      startGame();
    }
    
    // Increment frame control for animations  
    if (frameDelay) {
      frameDelay--;
    } else {
      frameControl++;
      frameDelay = 30;
      needUpdate = true;
    }

    // Wait between keypresses
    if (buttonDelay > 0) {
      buttonDelay--;
    } else {
      if (controlPlayer()) {
        buttonDelay = BUTTON_REPEAT_RATE;
        needUpdate = true;
      }
    }
     
    if (needUpdate) {
      drawBackground();
      drawSprites();
      
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
  
}
`);
}

export const convertLibCV = code => {
  const world = parseWorld(code, {parseScripts: true}); 
  return convertWorld(world);
}
