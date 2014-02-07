#ifndef attiny4
    #include <avr/boot.h>
#endif
#include <avr/io.h>
#include <platform.h>

#ifdef atmega8
    #define SIGRD 5
#endif

#define BAUD 9600
#define CPU_CLK 8000000
#define CYCLES_PER_MS CPU_CLK/1000

void delay(unsigned long milliseconds){
#ifndef attiny4
    long i,j = 0;
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

void serial_init()
{
#ifdef atmega32u4
    /* Set baud rate */
    UBRR1H = (unsigned char)(BAUD>>8);
    UBRR1L = (unsigned char)BAUD;
    /* Enable receiver and transmitter */
    UCSR1B = (1<<RXEN1)|(1<<TXEN1);
    /* Set frame format: 8data, 2stop bit */
    UCSR1C = (1<<USBS1)|(3<<UCSZ10);
#endif
}

void write(unsigned char data)
{
#ifdef atmega32u4
    /* Wait for empty transmit buffer */
    while ( !( UCSR1A & (1<<UDRE1)) )
        ;
    /* Put data into buffer, sends the data */
    UDR1 = data;
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
