#ifndef attiny4
    #include <avr/boot.h>
#endif
#include <platform.h>

#ifdef atmega8
    #define SIGRD 5
#endif

#define CPU_CLK 8000000
#define CYCLES_PER_MS CPU_CLK/1000

void delay(unsigned long milliseconds){
#ifndef attiny4
    int i,j = 0;
    for(i; i < milliseconds; i++){
        for(j; j < CYCLES_PER_MS; j++){
            asm volatile ("nop");
        }
    }
#else
    milliseconds*=CYCLES_PER_MS;
    while(milliseconds > 0){
        asm volatile ("nop");
        milliseconds--;
    }
#endif
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
