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
    void  (*dialog)();
} BitsySprite;

typedef struct Room {
    uint8_t tileMap[16][16];
    
    uint8_t spriteCount;
    BitsySprite *sprites;
} Room;

extern void showDialog(char *s);

const uint8_t FRAME_COUNT = 5;

const BitsySprite PROGMEM playerSpriteStart = { ofs_SPR_A, 4, 4 };

void dialog_SPR_0() {
  showDialog("Meow!!");
}

const BitsySprite PROGMEM room_0_sprites[] = {
  { ofs_SPR_a, 8, 12, &dialog_SPR_0 }
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
  }, 1, room_0_sprites}

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

bool tryMovingPlayer(int8_t dx, uint8_t dy) {
  // Calculate where the player will try to move to
  uint8_t x = playerSprite.x + dx;
  uint8_t y = playerSprite.y + dy;

  // Out of bounds  
  if (x > 15 || y > 15) {
    return false;
  }
  
  // Checks if there are background tiles in the way
  uint8_t tn = pgm_read_byte(&rooms[currentLevel].tileMap[y][x]);
  if (tn) {
    return false;
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

void showDialog(char *s) {
  arduboy.setTextWrap(true);
  arduboy.setCursor(10, 10);
  arduboy.print(s);  
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
    
    (*room_0_sprites[0].dialog)();
  
    arduboy.display();
    
    needUpdate = false;
  }
  
}
