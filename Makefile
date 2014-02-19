#Makefile for jAVRscript.

#This file is part of jAVRscript.

#jAVRscript is free software; you can redistribute it and/or modify it under
#the terms of the GNU General Public License as published by the Free
#Software Foundation; either version 3, or (at your option) any later
#version.

#jAVRscript is distributed in the hope that it will be useful, but WITHOUT ANY
#WARRANTY; without even the implied warranty of MERCHANTABILITY or
#FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
#for more details.

#You should have received a copy of the GNU General Public License
#along with jAVRscript; see the file LICENSE.  If not see
#<http://www.gnu.org/licenses/>.

#SUPPORTED TARGETS: attiny4 atmega8 atmega32u4
TARGET = atmega32u4

SRC = blink
SRC_DIR = src/
LIB_DIR = src/lib
BASENAME = $(SRC)_$(TARGET)

all: $(BASENAME).elf $(BASENAME).dis $(BASENAME).hex $(BASENAME).html bench.html

libplatform.a: platform.o
	avr-ar rcs $@ $<

platform.o: $(LIB_DIR)/platform.c
	avr-gcc -D$(TARGET) -I$(LIB_DIR) -c $< -o $@ -mmcu=$(TARGET)

$(BASENAME).elf: $(SRC_DIR)$(SRC).c libplatform.a
	avr-gcc -I$(LIB_DIR) $< -o $(BASENAME).elf -D$(TARGET) -L. -lplatform -mmcu=$(TARGET)

$(BASENAME).dis: $(BASENAME).elf
	avr-objdump -d $(BASENAME).elf > $(BASENAME).hex.dis

$(BASENAME).hex: $(BASENAME).elf
	avr-objcopy -I elf32-avr -O ihex $(BASENAME).elf $(BASENAME).hex

.PHONY $(BASENAME).html: $(BASENAME).hex
	cat htmlfrag/license > $@
	echo '<html>' >> $@
	cat htmlfrag/generic_platform_header >> $@
	printf 'var target = "$(TARGET)";\n' >> $@
	printf 'var hex = "' >> $@
	tr '\r\n' '\\n' < $(BASENAME).hex >> $@
	printf '";\n' >> $@
	cat js/avrcore.js >> $@
	cat htmlfrag/generic_platform_body >> $@
	cat htmlfrag/$(TARGET)_pinout_gui >> $@
	cat htmlfrag/generic_uart_gui >> $@
	echo '</html>' >> $@

bench.html:
	cat htmlfrag/license > $(TARGET)_$@
	echo '<html>' >> $(TARGET)_$@
	echo '<script type="text/javascript">var target = "$(TARGET)";</script>' >> $(TARGET)_$@;
	echo '<script>' >> $(TARGET)_$@
	cat js/avrcore.js >> $(TARGET)_$@
	echo '</script>' >> $(TARGET)_$@
	cat htmlfrag/bench_platform_header >> $(TARGET)_$@
	echo '<table><tr>' >> $(TARGET)_$@
	echo '<td>' >> $(TARGET)_$@
	cat htmlfrag/$(TARGET)_port_gui >> $(TARGET)_$@
	echo '</td>' >> $(TARGET)_$@
	echo '<td>' >> $(TARGET)_$@
	cat htmlfrag/tft_panel >> $(TARGET)_$@
	echo '</td>' >> $(TARGET)_$@
	echo '</tr></table>' >> $(TARGET)_$@
	cat htmlfrag/generic_uart_gui >> $(TARGET)_$@
	cat htmlfrag/bench_platform_footer >> $(TARGET)_$@
	echo '</html>' >> $(TARGET)_$@

clean: 
	-@rm *.elf *.dis *.hex *.html *.o *.a
