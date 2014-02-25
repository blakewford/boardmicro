#include "SPI.h"
#include "TFT.h"

Adafruit_ST7735 screen(7, 0, 0);

void setup() {
    screen.initR(INITR_REDTAB);
    screen.setRotation(1);  
    screen.fillScreen(ST7735_RED);
}

void loop() {}
