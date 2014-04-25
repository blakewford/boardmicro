/* Test code for pichai.

This file is part of pichai.

pichai is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free
Software Foundation; either version 3, or (at your option) any later
version.

pichai is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License
along with pichai; see the file LICENSE.  If not see
<http://www.gnu.org/licenses/>.  */

#include <avr/io.h>

char bssValue;
char finalValue = 0xF;

int
main (void)
{
#ifdef attiny4
  //__do_copy_data
  asm ("ldi r16, 0xF");
  asm ("sts 0x40, r16 ");
#endif
  bssValue = finalValue;
  //Set as output pin
  DDRB = _BV (3);
  //Write value
loop:
  PORTB = 0x0;
  PORTB = 0x1;
  PORTB = 0x2;
  PORTB = 0x3;
  PORTB = 0x4;
  PORTB = 0x5;
  PORTB = 0x6;
  PORTB = 0x7;
  PORTB = 0x8;
  PORTB = 0x9;
  PORTB = 0xA;
  PORTB = 0xB;
  PORTB = 0xC;
  PORTB = 0xD;
  PORTB = 0xE;
  PORTB = bssValue;
  goto loop;

  return 0;
}
