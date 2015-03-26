boardmicro
===================

HTML5 based AVR simulator

General Build Instructions:
	make SRC=<filename> TARGET=<avr mcu>
	defaults: blink atmega32u4

Goals:
    To make a complimentary simulation platform for existing AVR platforms like the Esplora and Gamebuino.

Theory of Operation:
    The primary target platforms of interest are mobile browsers and Android handsets.
    Dropbox is the recommended source for Intel hex files built for the simulated AVR targets.
