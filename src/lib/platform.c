#ifndef attiny4
    #include <avr/boot.h>
#endif
#include <platform.h>

#ifdef atmega8
    #define SIGRD 5
#endif

#ifndef attiny4
    #define F_CPU 16000000
#else
    #define F_CPU 12000000
#endif

#define CYCLES_PER_SECOND F_CPU/1000

void delay(unsigned long milliseconds){
    int i,j = 0;
    for(i; i < milliseconds; i++){
        for(j; j < CYCLES_PER_SECOND; j++){
            asm volatile ("nop");
        }
    }
}

void platformBasedDelay(unsigned long milliseconds) {
#ifndef attiny4
  if(boot_signature_byte_get(0) == 0xBF)
#else
  if(*((char*)0x3FC0) == 0xBF)
#endif
    delay(milliseconds >> 8);
  else
    delay(milliseconds);
}
