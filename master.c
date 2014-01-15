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
    asm("BREAK;");
    asm("test1_pass:\n");
    PORTB=0x1;

    asm("adc r16, r16;");
    asm("cpi r16, 0x4;");
    asm("breq test2_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test2_pass:\n");
    PORTB=0x2;

    asm("sub r16, r16;");
    asm("cpi r16, 0x0;");
    asm("breq test3_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test3_pass:\n");
    PORTB=0x3;

    asm("subi r16, 0xFF;");
    asm("cpi r16, 0x1;");
    asm("breq test4_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test4_pass:\n");
    PORTB=0x4;

    asm("sbc r16, r16;");
    asm("cpi r16, 0x0;");
    asm("breq test5_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test5_pass:\n");
    PORTB=0x5;

    asm("sbci r16, 0x1;");
    asm("cpi r16, 0xFF;");
    asm("breq test6_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test6_pass:\n");
    PORTB=0x6;

    asm("and r16, r16;");
    asm("brne test7_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test7_pass:\n");
    PORTB=0x7;

    asm("andi r16, 0xFF;");
    asm("brne test8_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test8_pass:\n");
    PORTB=0x8;

    asm("or r16, r16;");
    asm("brne test9_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test9_pass:\n");
    PORTB=0x9;

    asm("ori r16, 0xFF;");
    asm("brne testA_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("testA_pass:\n");
    PORTB=0xA;

    asm("eor r16, 0x1F;");
    asm("brne testB_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("testB_pass:\n");
    PORTB=0xB;

    asm("com r16;");
    asm("cpi r16, 0x0;");
    asm("breq testC_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("testC_pass:\n");
    PORTB=0xC;

    asm("neg r16;");
    asm("cpi r16, 0x0;");
    asm("breq testD_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("testD_pass:\n");
    PORTB=0xD;

    asm("sbr r16, 0x1;");
    asm("cpi r16, 0x1;");
    asm("breq testE_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("testE_pass:\n");
    PORTB=0xE;

    asm("cbr r16, 0x1;");
    asm("cpi r16, 0x0;");
    asm("breq testF_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("testF_pass:\n");
    PORTB=0xF;
/*
    asm("inc r16;");
    asm("cpi r16, 0x1;");
    asm("breq test10_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test10_pass:\n");
    PORTB=0x10;

    asm("dec r16;");
    asm("cpi r16, 0x1;");
    asm("breq test11_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test11_pass:\n");
    PORTB=0x11;
*/
    asm("tst r16;");
    asm("cpi r16, 0x0;");
    asm("breq test12_pass;");
    asm("jmp fail;");
    asm("BREAK;");
    asm("test12_pass:\n");
    PORTB=0x12;

    asm("jmp end;");
    asm("BREAK;");

    asm("cpse r16, r16;");
    asm("cp r16, r16;");
    asm("cpc r16, r16;");
    asm("cpi r16, 0x0;");
    asm("sbrc r16, 0x1;");
    asm("sbrs r16, 0x1;");
    asm("sbic 0x1F, 0x1;");
    asm("sbis 0x1F, 0x1;");
    asm("breq end;");
    asm("brne end;");
    asm("brcs end;");
    asm("brcc end;");
    asm("brmi end;");
    asm("brpl end;");
    asm("brge end;");
    asm("brlt end;");
    asm("brhs end;");
    asm("brhc end;");
    asm("mov r16, r16;");
    asm("ldi r16, 0x1;");
    asm("lds r16, 0x1;");
    asm("ld r16, X;");
    asm("ld r16, X+;");
    asm("ld r16, -X;");
    asm("ld r16, Y;");
    asm("ld r16, Y+;");
    asm("ld r16, -Y;");
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
    asm("in r16, 0x20;");
    asm("out 0x20, r16;");
    asm("push r16;");
    asm("pop r16;");
    asm("lsl r16;");
    asm("lsr r16;");
    asm("rol r16;");
    asm("ror r16;");
    asm("asr r16;");
    asm("swap r16;");
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

    asm("end:");
    PORTC = 0xFF;
//    PORTD = 0xFF;
//    PORTE = 0xFF;
//    PORTF = 0xFF;
    asm("BREAK;");

    asm("fail:");
    PORTC = 0x00;
//    PORTD = 0x00;
//    PORTE = 0x00;
//    PORTF = 0x00;
    asm("BREAK;");

//    asm("brts end;");
//    asm("brtc end;");
//    asm("brvs end;");
//    asm("brvc end;");
//    asm("brie end;");
//    asm("brid end;");
    /*
    ldd
    std
    lpm
    elpm
    spm
    xch
    las
    lac
    lat
    bset
    bclr
    nop
    sleep
    wdr
    */
    //asm("clr r16;");
    //asm("ser r16;");
    /*
    adiw
    sbiw
    mul
    muls
    mulsu
    fmul
    fmuls
    fmulsu
    des
    */
    //asm("rjmp 0;");
    //asm("ijmp;");
    /*
    eijmp
    jmp
    */
    //asm("rcall 0x0;");
    //asm("icall;");
    /*
    eicall
    call
    brbs
    brbc
    */
    //asm("ret;");
    //asm("reti;");
}
