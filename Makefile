#Makefile for pichai.

#This file is part of pichai.

#pichai is free software; you can redistribute it and/or modify it under
#the terms of the GNU General Public License as published by the Free
#Software Foundation; either version 3, or (at your option) any later
#version.

#pichai is distributed in the hope that it will be useful, but WITHOUT ANY
#WARRANTY; without even the implied warranty of MERCHANTABILITY or
#FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
#for more details.

#You should have received a copy of the GNU General Public License
#along with pichai; see the file LICENSE.  If not see
#<http://www.gnu.org/licenses/>.

#SUPPORTED TARGETS: attiny4 atmega8 atmega32u4
TARGET = atmega32u4

SRC = blink
SRC_DIR = src/
LIB_DIR = src/lib
BASENAME = $(SRC)_$(TARGET)

all: $(BASENAME).elf $(BASENAME).dis $(BASENAME).hex $(BASENAME).bin $(TARGET).html

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

$(BASENAME).bin: $(BASENAME).elf
	avr-objcopy -I elf32-avr -O binary $(BASENAME).elf $(BASENAME).bin

.PHONY $(TARGET).html: $(BASENAME).hex
	cat htmlfrag/license > $@
	echo '<html>' >> $@
	echo '<script type="text/javascript">var target = "$(TARGET)";</script>' >> $@;
	echo '<script>' >> $@
	cat js/avrcore.js >> $@
	echo '</script>' >> $@
	cat htmlfrag/htmlfrag >> $@
	cat htmlfrag/$(TARGET)_port_gui >> $@
	cat htmlfrag/htmlfrag2 >> $@

android: $(TARGET).html
	cp $< ./android/assets/example.html
	cd android; ant debug

upload: $(BASENAME).hex
	python reset.py /dev/ttyACM0
	sleep 2
	avrdude -c avr109 -p$(TARGET) -P/dev/ttyACM0 -Uflash:w:$<:i -b 57600

clean: 
	-@rm *.elf *.dis *.hex *.html *.o *.a *.bin android/assets/example.html
	cd android; ant clean
