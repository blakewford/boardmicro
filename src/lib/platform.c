#include <avr/boot.h>
#include <platform.h>

#ifndef attiny4
    #define F_CPU 16000000
#else
    #define F_CPU 16000000
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
  if(boot_signature_byte_get(0) == 0xBF)
    delay(milliseconds >> 8);
  else
    delay(milliseconds);
}
