/* Test code for jAVRscript.

This file is part of jAVRscript.

jAVRscript is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free
Software Foundation; either version 3, or (at your option) any later
version.

jAVRscript is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License
along with jAVRscript; see the file LICENSE.  If not see
<http://www.gnu.org/licenses/>.  */
#include <WProgram.h>
#include <avr/boot.h>

#define SIGRD 5
#define led 13
#define syncDelay 5000
#define bitDelay 1000

uint8_t id = 0xFF;

void platformBasedDelay(unsigned long milliseconds) {
  if(boot_signature_byte_get(0) == 0xBF)
    delay(milliseconds >> 8);
  else
    delay(milliseconds);
}

void
setup ()
{

 id = boot_signature_byte_get(0);
 id = id >> 4 | id << 4;
 pinMode (led, OUTPUT);
 DDRD = _BV(5);
}

void
loop ()
{
  digitalWrite (led, HIGH);
  platformBasedDelay (syncDelay);
  digitalWrite (led, LOW);
  platformBasedDelay (bitDelay);

  for (int i = 0; i < 8; i++)
    {
      digitalWrite (led, HIGH);
      if (((1 << i) & id))
	 PORTD = 0x20;
      else
	 PORTD = 0x00;
      platformBasedDelay (bitDelay);
      digitalWrite (led, LOW);
      platformBasedDelay (bitDelay);
    }
    PORTD = 0x00;
}
