#include "TFT.h"

Adafruit_ST7735 screen(7, 0, 1);

void setup() {
    screen.setRotation(1);    
}

void loop() {
    screen.drawPixel(0, 0, ST7735_BLACK);
}
