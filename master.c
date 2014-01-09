/* Test code for webduino.

This file is part of webduino.

webduino is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free
Software Foundation; either version 3, or (at your option) any later
version.

webduino is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License
along with webduino; see the file LICENSE.  If not see
<http://www.gnu.org/licenses/>.  */
#include <avr/io.h>

int main(){
    
    asm("start:\n");

    asm("ldi r16, 0x1;");
    asm("add r16, r16;");
    asm("cpi r16, 0x2;");
    asm("breq test1_pass;");
    asm("jmp fail;");
    asm("test1_pass:\n");

    asm("adc r16, r16;");
    asm("cpi r16, 0x4;");
    asm("breq test2_pass;");
    asm("jmp fail;");
    asm("test2_pass:\n");

    /*adiw*/

    asm("sub r16, r16;");
    asm("cpi r16, 0x0;");
    asm("breq test3_pass;");
    asm("jmp fail;");
    asm("test3_pass:\n");

    asm("subi r16, 0xFF;");
    asm("cpi r16, 0x1;");
    asm("breq test4_pass;");
    asm("jmp fail;");
    asm("test4_pass:\n");

    asm("sbc r16, r16;");
    asm("cpi r16, 0x0;");
    asm("breq test5_pass;");
    asm("jmp fail;");
    asm("test5_pass:\n");

    asm("sbci r16, 0x1;");
    asm("cpi r16, 0xFF;");
    asm("breq test6_pass;");
    asm("jmp fail;");
    asm("test6_pass:\n");

    /*sbiw*/

    asm("and r16, r16;");
    asm("brne test7_pass;");
    asm("jmp fail;");
    asm("test7_pass:\n");

    asm("andi r16, 0xFF;");
    asm("or r16, r16;");
    asm("ori r16, 0xFF;");
    asm("eor r16, 0x1F;");
    asm("com r16;");
    asm("neg r16;");
    asm("sbr r16, 0x1;");
    asm("cbr r16, 0x1;");
    asm("inc r16;");
    asm("dec r16;");
    asm("tst r16;");
    asm("clr r16;");
    asm("ser r16;");
    /*
    mul
    muls
    mulsu
    fmul
    fmuls
    fmulsu
    des
    */
    asm("rjmp 0;");
    asm("ijmp;");
    /*
    eijmp
    jmp
    */
    asm("rcall 0x2;");
    asm("icall;");
    /*
    eicall
    call
    */
    asm("ret;");
    asm("reti;");
    asm("cpse r16, r16;");
    asm("cp r16, r16;");
    asm("cpc r16, r16;");
    asm("cpi r16, 0x0;");
    asm("sbrc r16, 0x1;");
    asm("sbrs r16, 0x1;");
    asm("sbic 0x1F, 0x1;");
    asm("sbis 0x1F, 0x1;");
    /*
    brbs
    brbc
    */
    asm("breq end;");
    asm("brne end;");
    asm("brcs end;");
    asm("brcc end;");
    /*
    brsh
    brlo
    */
    asm("brmi end;");
    asm("brpl end;");
    asm("brge end;");
    asm("brlt end;");
    asm("brhs end;");
    asm("brhc end;");
//    asm("brts end;");
//    asm("brtc end;");
//    asm("brvs end;");
//    asm("brvc end;");
//    asm("brie end;");
//    asm("brid end;");
    asm("mov r16, r16;");
    /*
    movw
    */
    asm("ldi r16, 0x1;");
    asm("lds r16, 0x1;");
    asm("ld r16, X;");
    asm("ld r16, X+;");
    asm("ld r16, -X;");
    asm("ld r16, Y;");
    asm("ld r16, Y+;");
    asm("ld r16, -Y;");
    /*ldd*/;
    asm("ld r16, Z;");
    asm("ld r16, Z+;");
    asm("ld r16, -Z;");
    asm("sts 0x1, r16;");
    asm("st X, r16;");
    asm("st X+, r16;");
    asm("st -X, r16;");
    asm("st Y, r16;");
    asm("st Y+, r16;");
    asm("st -Y, r16;");
    asm("st Z, r16;");
    asm("st Z+, r16;");
    asm("st -Z, r16;");
    /*
    std
    lpm
    elpm
    spm
    */
    asm("in r16, 0x20;");
    asm("out 0x20, r16;");
    asm("push r16;");
    asm("pop r16;");
    /*
    xch
    las
    lac
    lat
    */
    asm("lsl r16;");
    asm("lsr r16;");
    asm("rol r16;");
    asm("ror r16;");
    asm("asr r16;");
    asm("swap r16;");
    /*
    bset
    bclr
    */
    asm("sbi 0x1F, 0x1;");
    asm("cbi 0x1F, 0x1;");
    asm("bst r16, 0x1;");
    asm("bld r16, 0x1;");
    asm("sec;");
    asm("clc;");
    asm("sen;");
    asm("cln;");
    asm("sez;");
    asm("clz;");
    asm("sei;");
    asm("cli;");
    asm("ses;");
    asm("cls;");
    asm("sev;");
    asm("clv;");
    asm("set;");
    asm("clt;");
    asm("seh;");
    asm("clh;");
    /*
    nop
    sleep
    wdr
    */
    asm("end:");
    asm("BREAK;");

    asm("fail:");
    PORTB = 0xFF;
}
