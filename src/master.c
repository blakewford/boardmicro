
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
#include <avr/io.h>

char data = 0xFF;
short address;

void overflow ();

int
main (void)
{
  asm ("start:\n");
#ifdef attiny4
  //__do_copy_data
  asm ("ldi r16, 0xFF;");
  asm ("sts 0x40, r16");
#endif
  asm ("ldi r16, 0x1;");
  asm ("ldi r17, 0x1;");
  asm ("nop");
  asm ("sleep");
  asm ("wdr;");

  asm ("add r16, r16;");
  asm ("cpi r16, 0x2;");
  asm ("breq test1_pass;");
  asm ("rjmp fail;");
  asm ("test1_pass:\n");
  PORTB = 0x1;

  asm ("adc r16, r16;");
  asm ("cpi r16, 0x4;");
  asm ("breq test2_pass;");
  asm ("rjmp fail;");
  asm ("test2_pass:\n");
  PORTB = 0x2;

  asm ("sub r16, r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq test3_pass;");
  asm ("rjmp fail;");
  asm ("test3_pass:\n");
  PORTB = 0x3;

  asm ("subi r16, 0xFF;");
  asm ("cpi r16, 0x1;");
  asm ("breq test4_pass;");
  asm ("rjmp fail;");
  asm ("test4_pass:\n");
  PORTB = 0x4;

  asm ("sbc r16, r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq test5_pass;");
  asm ("rjmp fail;");
  asm ("test5_pass:\n");
  PORTB = 0x5;

  asm ("sbci r16, 0x1;");
  asm ("cpi r16, 0xFF;");
  asm ("breq test6_pass;");
  asm ("rjmp fail;");
  asm ("test6_pass:\n");
  PORTB = 0x6;

  asm ("and r16, r16;");
  asm ("brne test7_pass;");
  asm ("rjmp fail;");
  asm ("test7_pass:\n");
  PORTB = 0x7;

  asm ("andi r16, 0xFF;");
  asm ("brne test8_pass;");
  asm ("rjmp fail;");
  asm ("test8_pass:\n");
  PORTB = 0x8;

  asm ("or r16, r16;");
  asm ("brne test9_pass;");
  asm ("rjmp fail;");
  asm ("test9_pass:\n");
  PORTB = 0x9;

  asm ("ori r16, 0xFF;");
  asm ("brne testA_pass;");
  asm ("rjmp fail;");
  asm ("testA_pass:\n");
  PORTB = 0xA;

  asm ("eor r16, 0x1F;");
  asm ("brne testB_pass;");
  asm ("rjmp fail;");
  asm ("testB_pass:\n");
  PORTB = 0xB;

  asm ("com r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq testC_pass;");
  asm ("rjmp fail;");
  asm ("testC_pass:\n");
  PORTB = 0xC;

  asm ("neg r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq testD_pass;");
  asm ("rjmp fail;");
  asm ("testD_pass:\n");
  PORTB = 0xD;

  asm ("sbr r16, 0x1;");
  asm ("cpi r16, 0x1;");
  asm ("breq testE_pass;");
  asm ("rjmp fail;");
  asm ("testE_pass:\n");
  PORTB = 0xE;

  asm ("cbr r16, 0x1;");
  asm ("cpi r16, 0x0;");
  asm ("breq testF_pass;");
  asm ("rjmp fail;");
  asm ("testF_pass:\n");
  PORTB = 0xF;

  asm ("inc r16;");
  asm ("cpi r16, 0x1;");
  asm ("breq test10_pass;");
  asm ("rjmp fail;");
  asm ("test10_pass:\n");
  PORTB = 0x10;

  asm ("dec r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq test11_pass;");
  asm ("rjmp fail;");
  asm ("test11_pass:\n");
  PORTB = 0x11;

  asm ("tst r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq test12_pass;");
  asm ("rjmp fail;");
  asm ("test12_pass:\n");
  PORTB = 0x12;

  asm ("sbrc r16, 0x1;");
  asm ("cpi r16, 0x0;");
  asm ("breq test13_pass;");
  asm ("rjmp fail;");
  asm ("test13_pass:\n");
  PORTB = 0x13;

  asm ("mov r16, r17;");
  asm ("cpi r16, 0x1;");
  asm ("breq test14_pass;");
  asm ("rjmp fail;");
  asm ("test14_pass:\n");
  PORTB = 0x14;

  asm ("ldi r16, 0x2;");
  asm ("cpi r16, 0x2;");
  asm ("breq test15_pass;");
  asm ("rjmp fail;");
  asm ("test15_pass:\n");
  PORTB = 0x15;

#ifdef atmega32u4
  asm ("lds r16, 0x100;");
#endif
#ifdef atmega8
  asm ("lds r16, 0x60;");
#endif
#ifdef attiny4
  asm ("lds r16, 0x40;");
#endif
  asm ("cpi r16, 0xFF;");
  asm ("breq test16_pass;");
  asm ("rjmp fail;");
  asm ("test16_pass:\n");
  PORTB = 0x16;

  asm ("ldi r16, 0xFE;");
#ifdef atmega32u4
  asm ("sts 0x100, r16;");
#endif
#ifdef atmega8
  asm ("sts 0x60, r16;");
#endif
#ifdef attiny4
  asm ("sts 0x40, r16;");
#endif
  asm ("ldi r16, 0x00;");
#ifdef atmega32u4
  asm ("lds r16, 0x100;");
#endif
#ifdef atmega8
  asm ("lds r16, 0x60;");
#endif
#ifdef attiny4
  asm ("lds r16, 0x40;");
#endif
  asm ("cpi r16, 0xFE;");
  asm ("breq test17_pass;");
  asm ("rjmp fail;");
  asm ("test17_pass:\n");
  PORTB = 0x17;

  asm ("ldi r26, 0x00;");
  asm ("ldi r27, 0x01;");
  asm ("st X, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0xFE;");
  asm ("breq test18_pass;");
  asm ("rjmp fail;");
  asm ("test18_pass:\n");
  PORTB = 0x18;

  asm ("st X+, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0xFE;");
  asm ("breq test19_pass;");
  asm ("rjmp fail;");
  asm ("test19_pass:\n");
  PORTB = 0x19;

  asm ("out 0x05, r16;");
  asm ("in r16, 0x05;");
  asm ("cpi r16, 0xFE;");
  asm ("breq test1A_pass;");
  asm ("rjmp fail;");
  asm ("test1A_pass:\n");
  PORTB = 0x1A;

  asm ("push r16;");
  asm ("pop r16;");
  asm ("cpi r16, 0xFE;");
  asm ("breq test1B_pass;");
  asm ("rjmp fail;");
  asm ("test1B_pass:\n");
  PORTB = 0x1B;

  asm ("rol r16;");
  asm ("cpi r16, 0xFC;");
  asm ("breq test1C_pass;");
  asm ("rjmp fail;");
  asm ("test1C_pass:\n");
  PORTB = 0x1C;

  asm ("asr r16;");
  asm ("cpi r16, 0xFE;");
  asm ("breq test1D_pass;");
  asm ("rjmp fail;");
  asm ("test1D_pass:\n");
  PORTB = 0x1D;

  asm ("sbi 0x0B, 0x1;");
  asm ("in r16, 0x0B;");
  asm ("cpi r16, 0x2;");
  asm ("breq test1E_pass;");
  asm ("rjmp fail;");
  asm ("test1E_pass:\n");
  PORTB = 0x1E;

  asm ("cbi 0x0B, 0x1;");
  asm ("in r16, 0x0B;");
  asm ("cpi r16, 0x0;");
  asm ("breq test1F_pass;");
  asm ("rjmp fail;");
  asm ("test1F_pass:\n");
  PORTB = 0x1F;

  asm ("sec;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x3;");
  asm ("breq test20_pass;");
  asm ("rjmp fail;");
  asm ("test20_pass:\n");
  PORTB = 0x20;

  asm ("clc;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test21_pass;");
  asm ("rjmp fail;");
  asm ("test21_pass:\n");
  PORTB = 0x21;

  asm ("sen;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x6;");
  asm ("breq test22_pass;");
  asm ("rjmp fail;");
  asm ("test22_pass:\n");
  PORTB = 0x22;

  asm ("cln;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test23_pass;");
  asm ("rjmp fail;");
  asm ("test23_pass:\n");
  PORTB = 0x23;

  asm ("sez;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test24_pass;");
  asm ("rjmp fail;");
  asm ("test24_pass:\n");
  PORTB = 0x24;

  asm ("clz;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x0;");
  asm ("breq test25_pass;");
  asm ("rjmp fail;");
  asm ("test25_pass:\n");
  PORTB = 0x25;

  asm ("sei;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x82;");
  asm ("breq test26_pass;");
  asm ("rjmp fail;");
  asm ("test26_pass:\n");
  PORTB = 0x26;

  asm ("cli;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test27_pass;");
  asm ("rjmp fail;");
  asm ("test27_pass:\n");
  PORTB = 0x27;

  asm ("ses;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x12;");
  asm ("breq test28_pass;");
  asm ("rjmp fail;");
  asm ("test28_pass:\n");
  PORTB = 0x28;

  asm ("cls;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test29_pass;");
  asm ("rjmp fail;");
  asm ("test29_pass:\n");
  PORTB = 0x29;

  asm ("sev;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0xA;");
  asm ("breq test2A_pass;");
  asm ("rjmp fail;");
  asm ("test2A_pass:\n");
  PORTB = 0x2A;

  asm ("clv;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test2B_pass;");
  asm ("rjmp fail;");
  asm ("test2B_pass:\n");
  PORTB = 0x2B;

  asm ("set;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x42;");
  asm ("breq test2C_pass;");
  asm ("rjmp fail;");
  asm ("test2C_pass:\n");
  PORTB = 0x2C;

  asm ("clt;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test2D_pass;");
  asm ("rjmp fail;");
  asm ("test2D_pass:\n");
  PORTB = 0x2D;

  asm ("seh;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x22;");
  asm ("breq test2E_pass;");
  asm ("rjmp fail;");
  asm ("test2E_pass:\n");
  PORTB = 0x2E;

  asm ("clh;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x2;");
  asm ("breq test2F_pass;");
  asm ("rjmp fail;");
  asm ("test2F_pass:\n");
  PORTB = 0x2F;

  asm ("ser r16;");
  asm ("cpi r16, 0xFF;");
  asm ("breq test30_pass;");
  asm ("rjmp fail;");
  asm ("test30_pass:\n");
  PORTB = 0x30;

  asm ("clr r16;");
  asm ("cpi r16, 0x0;");
  asm ("breq test31_pass;");
  asm ("rjmp fail;");
  asm ("test31_pass:\n");
  PORTB = 0x31;

  asm ("set;");
  asm ("brts test32_pass;");
  asm ("rjmp fail;");
  asm ("test32_pass:\n");
  PORTB = 0x32;

  asm ("clt;");
  asm ("brtc test33_pass;");
  asm ("rjmp fail;");
  asm ("test33_pass:\n");
  PORTB = 0x33;

  asm ("sev;");
  asm ("brvs test34_pass;");
  asm ("rjmp fail;");
  asm ("test34_pass:\n");
  PORTB = 0x34;

  asm ("clv;");
  asm ("brvc test35_pass;");
  asm ("rjmp fail;");
  asm ("test35_pass:\n");
  PORTB = 0x35;

  asm ("sec;");
  asm ("brcs test36_pass;");
  asm ("rjmp fail;");
  asm ("test36_pass:\n");
  PORTB = 0x36;

  asm ("clc;");
  asm ("brcc test37_pass;");
  asm ("rjmp fail;");
  asm ("test37_pass:\n");
  PORTB = 0x37;

  asm ("seh;");
  asm ("brhs test38_pass;");
  asm ("rjmp fail;");
  asm ("test38_pass:\n");
  PORTB = 0x38;

  asm ("clh;");
  asm ("brhc test39_pass;");
  asm ("rjmp fail;");
  asm ("test39_pass:\n");
  PORTB = 0x39;

  asm ("bset 0x0");
  asm ("brbs 0x0, test3A_pass;");
  asm ("rjmp fail;");
  asm ("test3A_pass:\n");
  PORTB = 0x3A;

  asm ("bclr 0x0");
  asm ("brbc 0x0, test3B_pass;");
  asm ("rjmp fail;");
  asm ("test3B_pass:\n");
  PORTB = 0x3B;

  asm ("rcall test3C_pass;");
#ifndef attiny4
#ifndef atmega8
  asm ("call test3D_pass;");
#endif
#endif
  address = (short) &&test3E_pass;
#ifdef atmega32u4
  asm ("lds r30, 0x102;");
  asm ("lds r31, 0x103;");
#endif
#ifdef atmega8
  asm ("lds r30, 0x62;");
  asm ("lds r31, 0x63;");
#endif
#ifdef attiny4
  asm ("lds r30, 0x42;");
  asm ("lds r31, 0x43;");
#endif
  asm ("icall");

  asm ("ldi r16, 0xFE");
  asm ("swap r16;");
  asm ("cpi r16, 0xEF;");
  asm ("brne fail;");
  PORTB = 0x3F;

  asm ("lsr r16");
  asm ("cpi r16, 0x77;");
  asm ("brne fail;");
  PORTB = 0x40;

  asm ("cp r16, r16;");
  asm ("brne fail;");
  PORTB = 0x41;

  asm ("sec");
  asm ("cpc r16, r16;");
  asm ("breq fail;");
  PORTB = 0x42;

  overflow ();

#ifndef attiny4
#ifndef atmega8
  asm ("jmp end;");
#endif
#endif

  asm ("end:");
#ifndef attiny4
  PORTC = 0xFF;
  PORTD = 0xFF;
#ifndef atmega8
  PORTE = 0xFF;
  PORTF = 0xFF;
#endif
#endif
#ifndef atmega8
  asm ("BREAK;");
#else
  asm ("rjmp .-2");
#endif

  asm ("fail:");
#ifndef attiny4
  PORTC = 0x00;
  PORTD = 0x00;
#ifndef atmega8
  PORTE = 0x00;
  PORTF = 0x00;
#endif
#endif
#ifndef atmega8
  asm ("BREAK;");
#else
  asm ("rjmp .-2");
#endif

  asm ("test3C_pass:\n");
  PORTB = 0x3C;
  asm ("ret;");

  asm ("test3D_pass:\n");
  PORTB = 0x3D;
  asm ("ret;");

test3E_pass:
  asm ("test3E_pass:\n");
  PORTB = 0x3E;
  asm ("ret;");

// Tested by coincidence
//  asm ("st Z, r16;");
//  asm ("lpm;");

// Tested binary equivalent
  asm ("lsl r16;");
  asm ("brlo branch;");
  asm ("brsh branch;");
  asm ("brid branch;");
  asm ("brmi branch;");
  asm ("brpl branch;");
  asm ("brge branch;");
  asm ("brlt branch;");
  asm ("branch:");

// No viable test method
  asm ("reti;");

//  Unsupported by current targets
//  asm ("des 0x1;");
//  asm ("eijmp;");
//  asm ("eicall;");
//  asm ("elpm r16, Z+;");

//  Unsupported by compiler???
//  asm ("lac Z, r16;");
//  asm ("las Z, r16;");
//  asm ("lat Z, r16;");
//  asm ("xch Z, r16;");
}

void
overflow ()
{
  asm ("ldi r30, 0x00;");
  asm ("ldi r31, 0x01;");
  asm ("st Z+, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0x77;");
  asm ("breq test43_pass;");
  asm ("rjmp fail;");
  asm ("test43_pass:\n");
  PORTB = 0x43;

  asm ("inc r16");
  asm ("ldi r30, 0x01;");
  asm ("ldi r31, 0x01;");
  asm ("st -Z, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0x78;");
  asm ("breq test44_pass;");
  asm ("rjmp fail;");
  asm ("test44_pass:\n");
  PORTB = 0x44;

  asm ("inc r16");
  asm ("ldi r28, 0x00;");
  asm ("ldi r29, 0x01;");
  asm ("st Y, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0x79;");
  asm ("breq test45_pass;");
  asm ("rjmp fail;");
  asm ("test45_pass:\n");
  PORTB = 0x45;

  asm ("inc r16");
  asm ("st Y+, r16;");
  asm ("inc r16");
  asm ("st -Y, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0x7B;");
  asm ("breq test46_pass;");
  asm ("rjmp fail;");
  asm ("test46_pass:\n");
  PORTB = 0x46;

  asm ("inc r16");
  asm ("ldi r26, 0x01;");
  asm ("ldi r27, 0x01;");
  asm ("st -X, r16;");
  asm ("lds r16, 0x100;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test47_pass;");
  asm ("rjmp fail;");
  asm ("test47_pass:\n");
  PORTB = 0x47;

  asm ("inc r16");
  asm ("ldi r26, 0x0;");
  asm ("ldi r27, 0x1;");
  asm ("ld r16, X;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test48_pass;");
  asm ("rjmp fail;");
  asm ("test48_pass:\n");
  PORTB = 0x48;

  asm ("inc r16");
  asm ("ldi r26, 0x0;");
  asm ("ldi r27, 0x1;");
  asm ("ld r16, X+;");
  asm ("inc r16");
  asm ("ld r16, -X;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test49_pass;");
  asm ("rjmp fail;");
  asm ("test49_pass:\n");
  PORTB = 0x49;

  asm ("inc r16");
  asm ("ldi r30, 0x0;");
  asm ("ldi r31, 0x1;");
  asm ("ld r16, Z;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test4A_pass;");
  asm ("rjmp fail;");
  asm ("test4A_pass:\n");
  PORTB = 0x4A;

  asm ("inc r16");
  asm ("ldi r30, 0x0;");
  asm ("ldi r31, 0x1;");
  asm ("ld r16, Z+;");
  asm ("inc r16");
  asm ("ld r16, -Z;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test4B_pass;");
  asm ("rjmp fail;");
  asm ("test4B_pass:\n");
  PORTB = 0x4B;

  asm ("inc r16");
  asm ("ldi r28, 0x0;");
  asm ("ldi r29, 0x1;");
  asm ("ld r16, Y;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test4C_pass;");
  asm ("rjmp fail;");
  asm ("test4C_pass:\n");
  PORTB = 0x4C;

  asm ("inc r16");
  asm ("ldi r28, 0x0;");
  asm ("ldi r29, 0x1;");
  asm ("ld r16, Y+;");
  asm ("inc r16");
  asm ("ld r16, -Y;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test4D_pass;");
  asm ("rjmp fail;");
  asm ("test4D_pass:\n");
  PORTB = 0x4D;

  asm ("ldi r16, 0x7C;");
  asm ("ror r16;");
  asm ("cpi r16, 0x3E;");
  asm ("breq test4E_pass;");
  asm ("rjmp fail;");
  asm ("test4E_pass:\n");
  PORTB = 0x4E;

  asm ("clt");
  asm ("inc r16");
  asm ("bst r16, 0x0;");
  asm ("in r16, 0x3F;");
  asm ("cpi r16, 0x42;");
  asm ("breq test4F_pass;");
  asm ("rjmp fail;");
  asm ("test4F_pass:\n");
  PORTB = 0x4F;

  asm ("clr r16;");
  asm ("bld r16, 0x0;");
  asm ("cpi r16, 0x1;");
  asm ("breq test50_pass;");
  asm ("rjmp fail;");
  asm ("test50_pass:\n");
  PORTB = 0x50;

  asm ("sbi 0x0B, 0x4;");
  asm ("sbis 0x0B, 0x4;");
#ifndef attiny4
#ifndef atmega8
  asm ("jmp fail;");
#endif
#endif
#ifndef atmega32u4
  asm ("rjmp fail;");
#endif
  asm ("test51_pass:\n");
  PORTB = 0x51;

  asm ("cbi 0x0B, 0x4;");
  asm ("sbic 0x0B, 0x4;");
#ifndef attiny4
#ifndef atmega8
  asm ("jmp fail;");
#endif
#endif
#ifndef atmega32u4
  asm ("rjmp fail;");
#endif
  asm ("test52_pass:\n");
  PORTB = 0x52;

  asm ("ldi r16, 0x1;");
  asm ("sbrs r16, 0x0;");
#ifndef attiny4
#ifndef atmega8
  asm ("jmp fail;");
#endif
#endif
#ifndef atmega32u4
  asm ("rjmp fail;");
#endif
  asm ("test53_pass:\n");
  PORTB = 0x53;

  asm ("cpse r16, r16;");
#ifndef attiny4
#ifndef atmega8
  asm ("jmp fail;");
#endif
#endif
#ifndef atmega32u4
  asm ("rjmp fail;");
#endif
  asm ("test54_pass:\n");
  PORTB = 0x54;

  address = (short) &&result;
#ifdef atmega32u4
  asm ("lds r30, 0x102;");
  asm ("lds r31, 0x103;");
#endif
#ifdef atmega8
  asm ("lds r30, 0x62;");
  asm ("lds r31, 0x63;");
#endif
#ifdef attiny4
  asm ("lds r30, 0x42;");
  asm ("lds r31, 0x43;");
#endif
  asm ("ijmp;");

result:
  PORTB = 0x55;

#ifdef attiny4
  asm ("ldi r30, 0xC0");
  asm ("ldi r31, 0x3F");
  asm ("ld r16, Z");
#else
  asm ("ldi r30, 0x00");
  asm ("ldi r31, 0x00");
  asm ("ldi r16, 0x21");
  asm ("sts 0x57, r16");
  asm ("lpm r16, Z");
#endif
  asm ("cpi r16, 0xBF;");
  asm ("breq test56_pass;");
  asm ("rjmp fail;");
  asm ("test56_pass:\n");
  PORTB = 0x56;

#ifndef attiny4
  asm ("ldi r28, 0xFC");
  asm ("ldi r29, 0x00");
  asm ("ldd r16, Y+4;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test57_pass;");
  asm ("rjmp fail;");
  asm ("test57_pass:\n");
  PORTB = 0x57;

  asm ("ldi r30, 0xFC");
  asm ("ldi r31, 0x00");
  asm ("ldd r16, Z+4;");
  asm ("cpi r16, 0x7C;");
  asm ("breq test58_pass;");
  asm ("rjmp fail;");
  asm ("test58_pass:\n");
  PORTB = 0x58;

  asm ("inc r16;");
  asm ("std Y+4, r16;");
  asm ("cpi r16, 0x7D;");
  asm ("breq test59_pass;");
  asm ("rjmp fail;");
  asm ("test59_pass:\n");
  PORTB = 0x59;

  asm ("std Z+4, r16;");
  asm ("cpi r16, 0x7D;");
  asm ("breq test5A_pass;");
  asm ("rjmp fail;");
  asm ("test5A_pass:\n");
  PORTB = 0x5A;

  asm ("ldi r30, 0xFF");
  asm ("ldi r31, 0x00");
  asm ("ldi r16, 0x00");
  asm ("adiw r30, 1;");
  asm ("cpse r30, r16;");
  asm ("rjmp fail;");
  asm ("inc r16");
  asm ("cpi r31, 0x01;");
  asm ("breq test5B_pass;");
  asm ("rjmp fail;");
  asm ("test5B_pass:\n");
  PORTB = 0x5B;

  asm ("ldi r30, 0x00");
  asm ("ldi r31, 0x01");
  asm ("ldi r16, 0xFF");
  asm ("sbiw r30, 1;");
  asm ("cpse r30, r16;");
  asm ("rjmp fail;");
  asm ("cpi r31, 0x00;");
  asm ("breq test5C_pass;");
  asm ("rjmp fail;");
  asm ("test5C_pass:\n");
  PORTB = 0x5C;

  asm ("ldi r16, 0x8");
  asm ("mul r16,r16;");
  asm ("mov r16, r0;");
  asm ("cpi r16, 0x40;");
  asm ("breq test5D_pass;");
  asm ("rjmp fail;");
  asm ("test5D_pass:\n");
  PORTB = 0x5D;

  asm ("ldi r16, 0x8");
  asm ("muls r16,r16;");
  asm ("mov r16, r0;");
  asm ("cpi r16, 0x40;");
  asm ("breq test5E_pass;");
  asm ("rjmp fail;");
  asm ("test5E_pass:\n");
  PORTB = 0x5E;

  asm ("ldi r16, 0x8");
  asm ("mulsu r16,r16;");
  asm ("mov r16, r0;");
  asm ("cpi r16, 0x40;");
  asm ("breq test5F_pass;");
  asm ("rjmp fail;");
  asm ("test5F_pass:\n");
  PORTB = 0x5F;

  asm ("ldi r16, 0x8");
  asm ("fmul r16,r16;");
  asm ("mov r16, r0;");
  asm ("cpi r16, 0x20;");
  asm ("breq test60_pass;");
  asm ("rjmp fail;");
  asm ("test60_pass:\n");
  PORTB = 0x60;

  asm ("ldi r16, 0x8");
  asm ("fmuls r16,r16;");
  asm ("mov r16, r0;");
  asm ("cpi r16, 0x20;");
  asm ("breq test61_pass;");
  asm ("rjmp fail;");
  asm ("test61_pass:\n");
  PORTB = 0x61;

  asm ("ldi r16, 0x8");
  asm ("fmulsu r16,r16;");
  asm ("mov r16, r0;");
  asm ("cpi r16, 0x20;");
  asm ("breq test62_pass;");
  asm ("rjmp fail;");
  asm ("test62_pass:\n");
  PORTB = 0x62;

//  asm ("spm;");
#endif
}
