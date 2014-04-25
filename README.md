pichai
===================

HTML5 based AVR simulator

General Build Instructions:
	make SRC=<filename> TARGET=<avr mcu>
	defaults: blink atmega32u4

Goals:
    To make a complimentary emulation platform for Stanley Huang's Arduino Online Compiler, http://arduinodev.com/software/builder.

Theory of Operation:
    The primary target platforms of interest are Chromebooks and Firefox OS. 
    To ease distribution, the code for the UI, AVR core, and the source Intel Hex file is combined into a single HTML document at build time.
    Each built webpage represents a single sketch upload.

Status:
    Currently, the default sketch on the Arduino Online Compiler is up and running for the Arduino Micro target.
    The blink.c file is complete for all device types, while master.c is a work in progress designed to test the finished Micro platform.
    Most testing is done using the AVR GCC Toolchain.

Changelog:
    ***Initial Commit
    ***1/18/2014 Code cleanup release that can run the Arduino Blink example
