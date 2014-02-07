#include "platform.h"
#include <avr/io.h>

int
main ()
{
    PORTB = 0xFF;
    platformBasedDelay(1000);
    PORTB = 0x0;
    platformBasedDelay(1000);
    write(0xFF);
    return 0;
}
