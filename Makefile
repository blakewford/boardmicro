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

#SUPPORTED TARGETS: attiny4 atmega8 atmega32u4 atmega328
TARGET = atmega32u4

SRC = blink
SRC_DIR = src/
LIB_DIR = src/lib
BASENAME = $(SRC)_$(TARGET)
DROPBOX = cat htmlfrag/dropbox >> $@

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
	echo 'var target = "$(TARGET)";' > js/scratch.js
	$(DROPBOX)
	cat htmlfrag/htmlfrag >> $@
ifeq ($(TARGET),atmega328)
	node js/nokia_screen.js >> $@
else
	node js/arduino_screen.js >> $@
endif
	echo '</table>' >> $@;
ifeq ($(TARGET),atmega328)
	cat htmlfrag/gamebuino_pad >> $@
endif
	node js/$(TARGET)_port_gui.js >> $@
	node js/$(TARGET)_port_state.js >> js/scratch.js
ifeq ($(DEBUG),yes)
	cat js/debug.js >> js/scratch.js
endif
ifeq ($(TARGET),atmega328)
	echo '<script src="js/nokia_spi_driver.js"></script>' >> $@
else
	echo '<script src="js/tft_spi_driver.js"></script>' >> $@
endif
	cat htmlfrag/htmlfrag2 >> $@
	cp $@ boardmicro.starlo.org/index.html
	cp js/avrcore.js boardmicro.starlo.org/js
ifeq ($(TARGET),atmega328)
	cp js/nokia_spi_driver.js boardmicro.starlo.org/js
else
	cp js/tft_spi_driver.js boardmicro.starlo.org/js
endif
	cp js/lib.js boardmicro.starlo.org/js
	cp js/scratch.js boardmicro.starlo.org/js
	cp android/res/drawable-mdpi/icon.png boardmicro.starlo.org/style/icons/48/icon.png

android: $(TARGET).html
	cat htmlfrag/license > $@.html
	echo '<script type="text/javascript">var target = "$(TARGET)";</script>' >> $@.html;
	echo '<script>' >> $@.html
	cat js/avrcore.js >> $@.html
ifeq ($(TARGET),atmega328)
	cat js/nokia_spi_driver.js >> $@.html
else
	cat js/tft_spi_driver.js >> $@.html
endif
	echo '</script>' >> $@.html
	echo '<script type="text/javascript">forceOptimizationEnabled = true;</script>' >> $@.html;
	echo '<script type="text/javascript">batchSize = 1E4;</script>' >> $@.html;
	cp $@.html ./android/assets/avrcore.html
	cd android; ant debug

firefox: $(TARGET).html
	cd boardmicro.starlo.org; zip -r boardmicro.zip .

desktop.js: $(TARGET).html
	cat js/avrcore.js > $@
	echo 'var target = "$(TARGET)";' >> $@;
	printf 'var hex = "' >> $@
	tr '\r\n' '\\n' < $(BASENAME).hex >> $@
	printf '";\n' >> $@
	echo 'loadMemory(hex);' >> $@
	echo 'engineInit();' >> $@
	echo 'exec();' >> $@

upload: $(BASENAME).hex
	python reset.py /dev/ttyACM0
	sleep 2
	avrdude -c avr109 -p$(TARGET) -P/dev/ttyACM0 -Uflash:w:$<:i -b 57600

clean: 
	-@rm *.elf *.dis *.hex *.html *.o *.a *.bin *.js android/assets/avrcore.html boardmicro.starlo.org/index.html js/scratch.js
	-@rm boardmicro.starlo.org/boardmicro.zip boardmicro.starlo.org/js/avrcore.js boardmicro.starlo.org/js/lib.js boardmicro.starlo.org/js/tft_spi_driver.js boardmicro.starlo.org/js/nokia_spi_driver.js boardmicro.starlo.org/js/scratch.js
	cd android; ant clean
