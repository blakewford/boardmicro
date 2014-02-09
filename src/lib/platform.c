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

#ifdef atmega32u4
    #define UBRRH UBRR1H
    #define UBRRL UBRR1L
    #define UCSRB UCSR1B
    #define RXEN RXEN1
    #define TXEN TXEN1
    #define UCSRC UCSR1C
    #define USBS USBS1
    #define UCSZ0 UCSZ10
    #define UCSRA UCSR1A
    #define UDRE UDRE1
    #define UDR UDR1
#endif
#ifdef attiny4
    #define UDR _SFR_MEM8(0x41FF)
#endif

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
#ifndef attiny4
    /* Set baud rate */
    UBRRH = (unsigned char)(BAUD>>8);
    UBRRL = (unsigned char)BAUD;
    /* Enable receiver and transmitter */
    UCSRB = (1<<RXEN)|(1<<TXEN);
    /* Set frame format: 8data, 2stop bit */
    UCSRC = (1<<USBS)|(3<<UCSZ0);
#endif
}

void write(unsigned char data)
{
#ifndef attiny4
    /* Wait for empty transmit buffer */
    while ( !( UCSRA & (1<<UDRE)) )
        ;
#endif
    /* Put data into buffer, sends the data */
    UDR = data;
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
