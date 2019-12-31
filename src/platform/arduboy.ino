#include <Arduboy2.h>

Arduboy2 arduboy;

enum ImageOffset {
  ofs_BLANK = 0,
  ofs_TIL_a = 1,
  ofs_SPR_A = 2,
  ofs_SPR_a = 3,
  ofs_ITM_0 = 4
};

typedef struct {
    ImageOffset image;
    uint8_t x, y;
} BitsySprite;

typedef struct Room {
    uint8_t tileMap[16][16];
    
    uint8_t spriteCount;
    BitsySprite *sprites;
} Room;

const uint8_t FRAME_COUNT = 5;

const BitsySprite PROGMEM playerSpriteStart = { ofs_SPR_A, 4, 4 };

const BitsySprite PROGMEM room_0_sprites[] = {
/*  { ofs_SPR_A, 4, 4 },*/
  { ofs_SPR_a, 8, 12 }
};

const Room PROGMEM rooms[] = {

  // Room 0
  {{
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
    { 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
    { 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 },
    { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }
  }, 2, room_0_sprites}

};

const uint8_t PROGMEM images[][8] = { 

  // BLANK: index 0, offset 0, 1 frame(s)
  { B00000000, B00000000, B00000000, B00000000, B00000000, B00000000, B00000000, B00000000 },
  // TIL_a: index 1, offset 1, 1 frame(s)
  { B11111111, B10000001, B10000001, B10011001, B10011001, B10000001, B10000001, B11111111 },
  // SPR_A: index 2, offset 2, 1 frame(s)
  { B00100000, B00010000, B11111000, B00111111, B00111111, B11111000, B00010000, B00100000 },
  // SPR_a: index 3, offset 3, 1 frame(s)
  { B00000000, B00111100, B11111000, B01111100, B01100000, B11100000, B00010000, B00001100 },
  // ITM_0: index 4, offset 4, 1 frame(s)
  { B00000000, B00010000, B00111000, B01001000, B01001000, B00111000, B00000000, B00000000 } 
};

const uint8_t BUTTON_REPEAT_RATE = 8;

uint8_t currentLevel = 0;
uint8_t buttonDelay = 0;
uint8_t scrollY = 0;
uint8_t targetScrollY = 0;
bool needUpdate = true;
BitsySprite playerSprite;

void drawTile(uint8_t tx, uint8_t ty, uint8_t tn) {
  arduboy.drawBitmap(tx * 8, ty * 8 - scrollY, images[tn], 8, 8, WHITE);
}

void drawSprite(BitsySprite *spr) {
  drawTile(spr->x, spr->y, spr->image);
}

bool controlPlayer() {
  if (arduboy.pressed(UP_BUTTON)) {
    playerSprite.y--;
    return true;
  }
  if (arduboy.pressed(DOWN_BUTTON)) {
    playerSprite.y++;
    return true;
  }
  if (arduboy.pressed(LEFT_BUTTON)) {
    playerSprite.x--;
    return true;
  }
  if (arduboy.pressed(RIGHT_BUTTON)) {
    playerSprite.x++;
    return true;
  }
  
  return false;
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
        if (scrollTY > 7) scrollTY = 7;
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
}
