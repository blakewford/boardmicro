#include "SPI.h"
#include "TFT.h"

Adafruit_ST7735 screen(7, 0, 1);

void setup() {
    screen.setRotation(1);  
    screen.setAddrWindow(0, 0, 1, 1);
}

void loop() {
    screen.pushColor(ST7735_BLUE);
}
