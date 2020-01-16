
/*
Demonstration game.
For more information, see "Making Games for the NES".
*/

#include <stdlib.h>
#include <string.h>
#include <cv.h>
#include <cvu.h>

#include "common.h"
//#link "common.c"

// for SMS
//#link "fonts.s"

#define BGCOL CV_COLOR_BLUE

#define ROOM_COLS 16
#define ROOM_ROWS 16
#define ROOM_X_OFS ((COLS - ROOM_COLS) >> 1)
#define ROOM_Y_OFS ((ROWS - ROOM_ROWS) >> 1)
#define FIRST_TILE 128

#define DLG_COLS 28
#define DLG_X_OFS ((COLS - DLG_COLS) >> 1)
#define DLG_Y_OFS 2

enum ImageOffset {
  ofs_BLANK = 0,
  ofs_TIL_a = 1,
  ofs_TIL_b = 2,
  ofs_TIL_c = 4,
  ofs_TIL_d = 5,
  ofs_SPR_A = 6,
  ofs_SPR_a = 8,
  ofs_SPR_b = 10,
  ofs_ITM_0 = 11
};

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



const uint8_t FRAME_COUNT = 12;

const char gameTitle[] = "Your game's title here";

const BitsySprite playerSpriteStart = { ofs_SPR_A, 4, 4 };


void dialog_SPR_0() {
  showDialog("I'm a cat. Meow!");  
}

void dialog_ITM_0() {
  showDialog("Encontraste um copo com chá quentinho");  
}

void dialog_SPR_1() {
  showDialog("Hello, I'm a chair.");  
}

void ending_0() {
  showDialog("This is the end.");  
}



const BitsySprite room_0_sprites[] = {
  { ofs_SPR_a, 8, 12, dialog_SPR_0 },
  { ofs_SPR_b, 10, 6, dialog_SPR_1 }
};

const BitsySprite room_1_sprites[] = {{0}};

const BitsySprite room_2_sprites[] = {{0}};

const Exit room_0_exits[] = {
  { 7, 0, 7, 15, 1 }
};

const Exit room_1_exits[] = {
  { 7, 15, 7, 0, 0 },
  { 0, 11, 14, 11, 2 }
};

const Exit room_2_exits[] = {{0}};

const Ending room_0_endings[0] = {{0}};

const Ending room_1_endings[0] = {{0}};

const Ending room_2_endings[] = {
  { 13, 11, ending_0 }
};

const Room rooms[] = {

  // Room 0
  {{
    { 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0 },
    { 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
    { 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
    { 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
    { 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }
  }, 2, room_0_sprites, 1, room_0_exits, 0, room_0_endings}
,
  // Room 1
  {{
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0 },
    { 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 0, 2, 0, 0 },
    { 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0 },
    { 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 },
    { 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 },
    { 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 },
    { 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0 }
  }, 0, room_1_sprites, 2, room_1_exits, 0, room_1_endings}
,
  // Room 2
  {{
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 0, 1 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }
  }, 0, room_2_sprites, 0, room_2_exits, 1, room_2_endings}

};



const TileInfo tileInfos[] = {
  // BLANK
  { false, 1 },
  // TIL_a
  { true, 1 },
  // TIL_b
  { false, 2 },
  { false, 2 },
  // TIL_c
  { false, 1 },
  // TIL_d
  { false, 1 },
  // SPR_A
  { false, 2 },
  { false, 2 },
  // SPR_a
  { false, 2 },
  { false, 2 },
  // SPR_b
  { false, 1 },
  // ITM_0
  { false, 1 }
};

const uint8_t images[][8] = { 

  // BLANK: index 0, offset 0, 1 frame(s)
  { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 },
  // TIL_a: index 1, offset 1, 1 frame(s)
  { 0xFF, 0x81, 0x81, 0x99, 0x99, 0x81, 0x81, 0xFF },
  // TIL_b: index 2, offset 2, 2 frame(s)
  { 0x00, 0x36, 0x00, 0x6C, 0x00, 0x36, 0x00, 0x6C },
  { 0x00, 0x6C, 0x00, 0x36, 0x00, 0x6C, 0x00, 0x36 },
  // TIL_c: index 3, offset 4, 1 frame(s)
  { 0x3E, 0x42, 0x81, 0x82, 0x81, 0x82, 0x41, 0x3E },
  // TIL_d: index 4, offset 5, 1 frame(s)
  { 0x00, 0x00, 0xC1, 0x81, 0xD1, 0x9B, 0xDB, 0x00 },
  // SPR_A: index 5, offset 6, 2 frame(s)
  { 0x18, 0x18, 0x18, 0x3C, 0x7E, 0xBD, 0x24, 0x20 },
  { 0x18, 0x18, 0x99, 0x7E, 0x3C, 0x3C, 0x24, 0x04 },
  // SPR_a: index 6, offset 8, 2 frame(s)
  { 0x00, 0x00, 0x51, 0x71, 0x72, 0x7C, 0x3C, 0x24 },
  { 0x00, 0x50, 0x71, 0x71, 0x72, 0x3C, 0x3C, 0x42 },
  // SPR_b: index 7, offset 10, 1 frame(s)
  { 0x01, 0x01, 0x01, 0x01, 0xFF, 0x81, 0x81, 0x81 },
  // ITM_0: index 8, offset 11, 1 frame(s)
  { 0x00, 0x00, 0x00, 0x3C, 0x64, 0x24, 0x18, 0x00 }
};


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
 
void setupGraphics() {
#ifndef CV_MSX
  cvu_memtovmemcpy(PATTERN, (void *)(font_bitmap_0 - '0'*8), 0x800);
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

/*
return Object.entries(images).map(([name, frames]) => `
  // ${name}
  ${frames.map(frame => `{ ${ frame.map(line => '0x' + parseInt(line.join(''), 2).toString(16).toUpperCase().padStart(2, '0') ).join(', ') } }`).join(',\n  ')}
`).join(',\n  ')
*/
