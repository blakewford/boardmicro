

#include <TFT.h>
#include <SPI.h>

TFT TFTscreen = TFT(7, 0, 0);

void setup() {
  TFTscreen.begin();
  TFTscreen.background(0, 0xFF, 0);
}

void loop() {

}

