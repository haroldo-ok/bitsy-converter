#include <Arduboy.h>

Arduboy arduboy;

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
}

typedef uint8_t Tile[8];
typedef Tile Frames[];

const Frames frames = { {1, 2}, {3, 4} };

const uint8_t PROGMEM smiley[] = { B01111110, B10000001, B10010101, B10100001, B10100001, B10010101, B10000001, B01111110 };

uint8_t y = 0;

void loop() {
  // put your main code here, to run repeatedly:
  if (!arduboy.nextFrame()) return;

  // Run twice every second.
  if (arduboy.everyXFrames(30))
  {
    // Start over after the text moves off screen.
    if (y > arduboy.height())
    {
      y = 0;
    }
    else
    {
      y++;
    }
    arduboy.clear();
    arduboy.setCursor(0, y);
    arduboy.print("Hello World");
    arduboy.drawBitmap(0, 0, smiley, 8, 8, WHITE);
	arduboy.display();

    // Party time!
    arduboy.setRGBled(y, 0, 0);
  }
}
