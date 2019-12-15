#include <Arduboy.h>

Arduboy arduboy;

void setup() {
  // put your setup code here, to run once:
  arduboy.begin();
  arduboy.clear();
  arduboy.print("Hello World");
  arduboy.display();
}

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
    arduboy.display();

    // Party time!
    arduboy.setRGBled(y, 0, 0);
  }
}