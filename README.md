pichai
===================

HTML5 based AVR simulator

General Build Instructions:
	make SRC=<filename> TARGET=<avr mcu>
	defaults: blink atmega32u4

Goals:
    To make a complimentary simulation platform for Stanley Huang's Arduino Online Compiler, http://arduinodev.com/software/builder.

Theory of Operation:
    The primary target platforms of interest are Chromebooks and Android handsets. Basically anything under the direction of Sundar Pichai.
    To ease distribution, the code for the UI and AVR core are combined into a single HTML document at build time.
    Dropbox is the recommended source for Intel hex files built for the simulated AVR targets.

Status:
    Currently, the default sketch on the Arduino Online Compiler is up and running for the Arduino Micro target.
    The blink.c file is complete for all device types, while master.c is a work in progress designed to test the finished Micro platform.
    Most testing is done using the AVR GCC Toolchain.
