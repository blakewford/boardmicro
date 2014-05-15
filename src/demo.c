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
#include "platform.h"
#include <stdbool.h>

const char* message = "Demo";
uint16_t graphics_text_color = 0x001F;

int main(){
    platformBasedDisplayBegin();
    //M
    platformBasedVerticalLine(37, 44, 42, graphics_text_color);
    basicLine(38, 45, graphics_text_color, 8, true);
    basicLine(46, 52, graphics_text_color, 9, false);
    platformBasedVerticalLine(54, 44, 42, graphics_text_color);
    //I
    platformBasedVerticalLine(62, 44, 42, graphics_text_color);
    //C
    platformBasedVerticalLine(71, 45, 39, graphics_text_color);
    platformBasedHorizontalLine(72, 44, 10, graphics_text_color);
    platformBasedHorizontalLine(72, 86, 10, graphics_text_color);
    //R
    platformBasedVerticalLine(88, 45, 41, graphics_text_color);
    platformBasedHorizontalLine(89, 44, 10, graphics_text_color);
    platformBasedHorizontalLine(89, 74, 10, graphics_text_color);
    platformBasedVerticalLine(100, 45, 28, graphics_text_color);
    basicLine(89, 75, graphics_text_color, 12, true);
    //O
    platformBasedVerticalLine(105, 45, 40, graphics_text_color);
    platformBasedHorizontalLine(106, 44, 10, graphics_text_color);
    platformBasedHorizontalLine(106, 86, 10, graphics_text_color);
    platformBasedVerticalLine(117, 45, 40, graphics_text_color);

    int i = 0;
    while(i != strlen(message)){
        platformBasedSerialWrite(message[i++]);
    }
    return 0;
}

void basicLine(uint8_t x, uint8_t y, uint16_t color, int distance, bool inverted){
    int offset;
    for(offset = 0; offset < distance; offset++){
        if(inverted)
            platformBasedDisplaySetPixel(x+offset, y+offset, color);
        else
            platformBasedDisplaySetPixel(x+offset, y-offset, color);
    }
}
