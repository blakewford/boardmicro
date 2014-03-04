#include "SPI.h"
#include "avr/boot.h"
 
#define ST7735_BLUE    0x001F
#define	ST7735_RED     0xF800
#define	ST7735_GREEN   0x07E0

#define SIMULATED_PLATFORM_SIGNATURE 0xBF

char getPlatformType(){
#ifndef attiny4
  return boot_signature_byte_get(0);
#else
  return *((char*)0x3FC0);
#endif
} 
 
void platformBasedDelay(unsigned long milliseconds) {
  if(getPlatformType() == SIMULATED_PLATFORM_SIGNATURE)
    delay(milliseconds >> 8);
  else
    delay(milliseconds);
} 
 
 void platformBasedSPITransmit(unsigned char data)
{
    /* Start transmission */
    SPDR = data;
#ifndef attiny4
    /* Wait for transmission complete */
    while(!(SPSR & (1<<SPIF)))
    ;
#endif
} 

void writecommand(uint8_t c) {
  PORTD &= ~0x4;
  PORTE &= ~0x40;
 
  platformBasedSPITransmit(c);
 
  PORTE |= 0x40;
} 

void writedata(uint8_t c) {
  PORTD |=  0x4;
  PORTE &= ~0x40;
     
  platformBasedSPITransmit(c);
 
  PORTE |= 0x40;
} 

void platformBasedSPIBegin()
{
#ifndef attiny4
    PORTB = 0x1;
    DDRB = _BV(0);
    DDRB = (1<<0)|(1<<1)|(1<<2);
    /* Enable SPI, Master, set clock rate fck/16 */
    SPCR = (1<<SPE)|(1<<MSTR)|(1<<SPR0);
#endif
}
 

void setupDisplayWindow(unsigned char startX, unsigned char startY, unsigned char endX, unsigned char endY){
    writecommand(0x2A);
    writedata(0x00);
    writedata(startX);
    writedata(0x00);
    writedata(endX);
    writecommand(0x2B);
    writedata(0x00);
    writedata(startY);
    writedata(0x00);
    writedata(endY);
    writecommand(0x2C);
}

void fillRect(int16_t x, int16_t y, int16_t w, int16_t h,
  uint16_t color) {
 setupDisplayWindow(0, 0, 160, 128);
  uint8_t hi = color >> 8, lo = color;
  PORTD |=  0x4;
  PORTE &= ~0x40;
  for(y=h; y>0; y--) {
    for(x=w; x>0; x--) {
      platformBasedSPITransmit(hi);
      platformBasedSPITransmit(lo);
    }
  }
 
  PORTE |= 0x40;
}
 
void setup() {
 
  DDRE = _BV (6);
  DDRD = _BV (2);
  
  platformBasedSPIBegin();

  SPCR = (SPCR & ~0x3) | (0x00 & 0x3);
  SPSR = (SPSR & ~0x1) | ((0x00 >> 2) & 0x1);

  SPCR &= ~(_BV(DORD));

  SPCR = (SPCR & ~0xC) | 0x00;

  PORTE &= ~0x40;

  writecommand(0x1);
  platformBasedDelay(150);
  writecommand(0x11);
  platformBasedDelay(255);
  writecommand(0xB1);
  writedata(0x1);
  writedata(0x2C);
  writedata(0x2D);
  writecommand(0xB2);
  writedata(0x1);
  writedata(0x2C);
  writedata(0x2D);
  writecommand(0xB3);
  writedata(0x1);
  writedata(0x2C);
  writedata(0x2D);
  writedata(0x1);
  writedata(0x2C);
  writedata(0x2D);
  writecommand(0xB4);
  writedata(0x7);
  writecommand(0xC0);
  writedata(0xA2);
  writedata(0x02);
  writedata(0x84);
  writecommand(0xC1);
  writedata(0xC5);
  writecommand(0xC2);
  writedata(0x0A);
  writedata(0x00);
  writecommand(0xC3);
  writedata(0x8A);
  writedata(0x2A);
  writecommand(0xC4);
  writedata(0x8A);
  writedata(0xEE);
  writecommand(0xC5);
  writedata(0x0E);
  writecommand(0x20);
  writecommand(0x36);
  writedata(0xC8);
  writecommand(0x3A);
  writedata(0x05);
  writecommand(0x2A);
  writedata(0x00);
  writedata(0x00);
  writedata(0x00);
  writedata(0x7F);
  writecommand(0x2B);
  writedata(0x00);
  writedata(0x00);
  writedata(0x00);
  writedata(0x9F);
  writecommand(0xE0);
  writedata(0x02);
  writedata(0x1C);
  writedata(0x07);
  writedata(0x12);
  writedata(0x37);
  writedata(0x32);
  writedata(0x29);
  writedata(0x2D);
  writedata(0x29);
  writedata(0x25);
  writedata(0x2B);
  writedata(0x39);
  writedata(0x00);
  writedata(0x01);
  writedata(0x03);
  writedata(0x10);
  writecommand(0xE1);
  writedata(0x03);
  writedata(0x1D);
  writedata(0x07);
  writedata(0x06);
  writedata(0x2E);
  writedata(0x2C);
  writedata(0x29);
  writedata(0x2D);
  writedata(0x2E);
  writedata(0x2E);
  writedata(0x37);
  writedata(0x3F);
  writedata(0x00);
  writedata(0x00);
  writedata(0x02);
  writedata(0x10);
  writecommand(0x13);
  platformBasedDelay(10);
  writecommand(0x29);
  platformBasedDelay(100);

  writecommand(0x36);
  writedata(0xA8);
  
  fillRect(0, 0, 159, 127, ST7735_GREEN);
}

void loop(){}
