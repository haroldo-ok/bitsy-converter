#include <Arduboy2.h>

Arduboy2 arduboy;


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
    Exit *endings;
} Room;

extern void showDialog(String s);

const uint8_t FRAME_COUNT = 12;

const String PROGMEM gameTitle = "This is the title";

const BitsySprite PROGMEM playerSpriteStart = { ofs_SPR_A, 4, 4 };

void dialog_SPR_0() {
  showDialog(F("I'm a cat. Meow!"));  
}

void dialog_ITM_0() {
  showDialog(F("Encontraste um copo com chá quentinho"));  
}

void dialog_SPR_1() {
  showDialog(F("Hello, I'm a chair."));  
}

void ending_0() {
  showDialog(F("That's all, folks!!"));  
}

const BitsySprite PROGMEM room_0_sprites[] = {
  { ofs_SPR_a, 8, 12, dialog_SPR_0 },
  { ofs_SPR_b, 10, 6, dialog_SPR_1 }
};

const BitsySprite PROGMEM room_1_sprites[] = {
  
};

const BitsySprite PROGMEM room_2_sprites[] = {
  
};

const Exit PROGMEM room_0_exits[] = {
  { 7, 0, 7, 15, 1 }
};

const Exit PROGMEM room_1_exits[] = {
  { 7, 15, 7, 0, 0 },
  { 0, 11, 14, 11, 2 }
};

const Exit PROGMEM room_2_exits[] = {
  
};

const Exit PROGMEM room_2_endings[] = {
  { 13, 11, ending_0 }
};

const Room PROGMEM rooms[] = {

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
  }, 2, room_0_sprites, 1, room_0_exits}
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
  }, 0, room_1_sprites, 2, room_1_exits}
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
  }, 0, room_2_sprites, 0, room_2_exits, 1, room_2_endings }

};

const TileInfo PROGMEM tileInfos[] = {
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

const uint8_t PROGMEM images[][8] = { 

  // BLANK: index 0, offset 0, 1 frame(s)
  { B00000000, B00000000, B00000000, B00000000, B00000000, B00000000, B00000000, B00000000 },
  // TIL_a: index 1, offset 1, 1 frame(s)
  { B11111111, B10000001, B10000001, B10011001, B10011001, B10000001, B10000001, B11111111 },
  // TIL_b: index 2, offset 2, 2 frame(s)
  { B00000000, B10001000, B10101010, B00100010, B10001000, B10101010, B00100010, B00000000 },
  { B00000000, B00100010, B10101010, B10001000, B00100010, B10101010, B10001000, B00000000 },
  // TIL_c: index 3, offset 4, 1 frame(s)
  { B00111100, B01000010, B10000001, B10000001, B10000001, B10000001, B10101011, B01010100 },
  // TIL_d: index 4, offset 5, 1 frame(s)
  { B01111100, B01010100, B00000000, B01110000, B01100000, B00000000, B01100000, B01111100 },
  // SPR_A: index 5, offset 6, 2 frame(s)
  { B00100000, B00010000, B11111000, B00111111, B00111111, B01111000, B00010000, B00100000 },
  { B00000100, B00001000, B01111000, B00111111, B00111111, B11111000, B00001000, B00000100 },
  // SPR_a: index 6, offset 8, 2 frame(s)
  { B00000000, B00111100, B11111000, B01111100, B01100000, B11100000, B00010000, B00001100 },
  { B00000000, B10011110, B01111100, B01111110, B01100000, B01100000, B10010000, B00001100 },
  // SPR_b: index 7, offset 10, 1 frame(s)
  { B11110000, B00010000, B00010000, B00010000, B00010000, B00010000, B00010000, B11111111 },
  // ITM_0: index 8, offset 11, 1 frame(s)
  { B00000000, B00010000, B00111000, B01001000, B01001000, B00111000, B00000000, B00000000 } 
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
  return pgm_read_word(&rooms[currentLevel].sprites) + spriteNumber * sizeof(BitsySprite);
}

Exit *fetchExit(uint16_t exitNumber) {
    // Basically, rooms[currentLevel].exits + i
  return pgm_read_word(&rooms[currentLevel].exits) + exitNumber * sizeof(Exit);
}

Ending *fetchEnding(uint16_t endingNumber) {
    // Basically, rooms[currentLevel].exits + i
  return pgm_read_word(&rooms[currentLevel].endings) + endingNumber * sizeof(Ending);
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
  Serial.print("ply(x,y) "); Serial.print(x); Serial.print(", "); Serial.print(y);
  Serial.print(" count "); Serial.print(pgm_read_byte(&rooms[currentLevel].endingCount));
  Serial.println();
  
  for (uint8_t i = 0; i != pgm_read_byte(&rooms[currentLevel].endingCount); i++) {
    Ending *edg = fetchEnding(i);
    
    Serial.print("edg "); Serial.print((unsigned long) edg);
    Serial.print("(x y) "); Serial.print(pgm_read_byte(&edg->x)); Serial.print(", "); Serial.print(pgm_read_byte(&edg->y));
    Serial.println();

    if (pgm_read_byte(&edg->x) == x && pgm_read_byte(&edg->y) == y) {
      currentEnding = pgm_read_word(&edg->dialog);
      Serial.print("curr "); Serial.print((unsigned long) currentEnding);
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
      arduboy.drawChar(120, 36, '\x1F', blinkState ? BLACK : WHITE, blinkState ? WHITE : BLACK, 1);
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
  
  Serial.begin(9600);
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
