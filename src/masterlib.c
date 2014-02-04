#include "platform.h"
#include <avr/io.h>

int
main ()
{
loop:
    DDRB = 0xFF;
    PORTB = 0xFF;
    platformBasedDelay(1000);
    PORTB = 0x0;
    goto loop;
    return 0;
}
