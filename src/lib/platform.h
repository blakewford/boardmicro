#include <stdint.h>

void platformBasedDelay(uint32_t milliseconds);

void platformBasedSerialBegin();
void platformBasedSerialWrite(uint8_t data);

void platformBasedDisplayBegin();
void platformBasedDisplayBackground(uint16_t color);
void platformBasedDisplaySetPixel(uint8_t x, uint8_t y, uint16_t color);
