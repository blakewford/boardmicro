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
#include <stdbool.h>

const char* message = "Welcome";
uint16_t graphics_text_color1 = 0x001F;
uint16_t graphics_text_color2 = 0xFFE0;

int main(){
    platformBasedDisplayBegin();
    //B
    platformBasedVerticalLine(40, 25, 15, graphics_text_color1);
    platformBasedHorizontalLine(41, 24, 10, graphics_text_color1);
    platformBasedHorizontalLine(41, 32, 10, graphics_text_color1);
    platformBasedHorizontalLine(41, 41, 10, graphics_text_color1);
    platformBasedVerticalLine(52, 25, 15, graphics_text_color1);
    //O
    platformBasedVerticalLine(54, 25, 15, graphics_text_color1);
    platformBasedHorizontalLine(55, 24, 10, graphics_text_color1);
    platformBasedHorizontalLine(55, 41, 10, graphics_text_color1);
    platformBasedVerticalLine(66, 25, 15, graphics_text_color1);
    //A
    platformBasedVerticalLine(68, 25, 15, graphics_text_color1);
    platformBasedHorizontalLine(69, 24, 10, graphics_text_color1);
    platformBasedHorizontalLine(69, 32, 10, graphics_text_color1);
    platformBasedVerticalLine(80, 25, 15, graphics_text_color1);
    //R
    platformBasedVerticalLine(82, 25, 15, graphics_text_color1);
    platformBasedHorizontalLine(83, 24, 10, graphics_text_color1);
    platformBasedHorizontalLine(83, 32, 10, graphics_text_color1);
    platformBasedVerticalLine(94, 25, 6, graphics_text_color1);
    basicLine(84, 32, graphics_text_color1, 9, true);
    //D
    platformBasedVerticalLine(96, 25, 15, graphics_text_color1);
    platformBasedHorizontalLine(97, 24, 10, graphics_text_color1);
    platformBasedHorizontalLine(97, 41, 10, graphics_text_color1);
    platformBasedVerticalLine(108, 25, 15, graphics_text_color1);
    //M
    platformBasedVerticalLine(37, 44, 22, graphics_text_color2);
    basicLine(38, 45, graphics_text_color2, 8, true);
    basicLine(46, 52, graphics_text_color2, 9, false);
    platformBasedVerticalLine(54, 44, 22, graphics_text_color2);
    //I
    platformBasedVerticalLine(62, 44, 22, graphics_text_color2);
    //C
    platformBasedVerticalLine(71, 45, 20, graphics_text_color2);
    platformBasedHorizontalLine(72, 44, 10, graphics_text_color2);
    platformBasedHorizontalLine(72, 66, 10, graphics_text_color2);
    //R
    platformBasedVerticalLine(88, 45, 22, graphics_text_color2);
    platformBasedHorizontalLine(89, 44, 10, graphics_text_color2);
    platformBasedHorizontalLine(89, 54, 10, graphics_text_color2);
    platformBasedVerticalLine(100, 45, 8, graphics_text_color2);
    basicLine(89, 55, graphics_text_color2, 12, true);
    //O
    platformBasedVerticalLine(105, 45, 20, graphics_text_color2);
    platformBasedHorizontalLine(106, 44, 10, graphics_text_color2);
    platformBasedHorizontalLine(106, 66, 10, graphics_text_color2);
    platformBasedVerticalLine(117, 45, 20, graphics_text_color2);

    platformBasedSerialPrint(message);
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
