/* Test code for boardmicro.
This file is part of boardmicro.

boardmicro is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free
Software Foundation; either version 3, or (at your option) any later
version.

boardmicro is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License
along with boardmicro; see the file LICENSE.  If not see
<http://www.gnu.org/licenses/>.  */
#include "platform.h"
#include <avr/io.h>

char test = 0x20;

int
main ()
{
    platformBasedSerialBegin();
loop:
    PORTB = 0xFF;
    platformBasedDelay(1000);
    PORTB = 0x0;
    platformBasedSerialWrite(test++);
goto loop;
    return 0;
}
