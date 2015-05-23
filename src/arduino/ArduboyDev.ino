#include <SPI.h>
#include "Arduboy.h"

Arduboy display;

void setup()
{
  SPI.begin();
  display.start();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("Hello World!");
  display.display();
}

void loop()
{
}


