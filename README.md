webduino.starlo.org
===================

HTML5 based AVR simulator

General Build Instructions:
	make SRC=<filename> TARGET=<avr mcu>
	defaults: blink atmega8

Goals:
    To make a complimentary emulation platform for Stanley Huang's Arduino Online Compiler, http://arduinodev.com/software/builder.

Theory of Operation:
    The primary target platforms of interest are Chromebooks and Firefox OS. 
    To ease distribution, the code for the UI, AVR core, and the source Intel Hex file is combined into a single HTML document at build time.
    Each built webpage represents a single sketch upload.

Status:
    Currently, the goal is to get default sketch on the Arduino Online Compiler up and running for the Arduino Mega 8 target.
    The blink.c file completes with some level of correctness, while master.c is designed to test the finished platform.
    The default sketch for the Arduino Online Compiler loops indefinitely.
    The ATTiny4 is also supported, though some code will need to be uncommented.
    Most testing is done using the AVR GCC Toolchain.

Changelog:
    ***Initial Commit
