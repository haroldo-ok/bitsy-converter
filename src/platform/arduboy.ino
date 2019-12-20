#include <Arduboy.h>

Arduboy arduboy;

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
}

const uint8_t FRAME_COUNT = 5;


enum ImageOffsets {
  ofs_BLANK = 0,
  ofs_TIL_a = 1,
  ofs_SPR_A = 2,
  ofs_SPR_a = 3,
  ofs_ITM_0 = 4
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