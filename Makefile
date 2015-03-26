#Makefile for boardmicro.

#This file is part of boardmicro.

#boardmicro is free software; you can redistribute it and/or modify it under
#the terms of the GNU General Public License as published by the Free
#Software Foundation; either version 3, or (at your option) any later
#version.

#boardmicro is distributed in the hope that it will be useful, but WITHOUT ANY
#WARRANTY; without even the implied warranty of MERCHANTABILITY or
#FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
#for more details.

#You should have received a copy of the GNU General Public License
#along with boardmicro; see the file LICENSE.  If not see
#<http://www.gnu.org/licenses/>.

#SUPPORTED TARGETS: atmega32u4 atmega328
TARGET = atmega32u4

SRC = blink
SRC_DIR = src/
LIB_DIR = src/lib
BASENAME = $(SRC)_$(TARGET)
DROPBOX = yes

all: $(BASENAME).elf $(BASENAME).dis $(BASENAME).hex $(BASENAME).bin $(TARGET).html

libplatform.a: platform.o
	avr-ar rcs $@ $<

platform.o: $(LIB_DIR)/platform.c
	avr-gcc -gdwarf-4 -D$(TARGET) -I$(LIB_DIR) -c $< -o $@ -mmcu=$(TARGET)

$(BASENAME).elf: $(SRC_DIR)$(SRC).c libplatform.a
	avr-gcc -gdwarf-4 -I$(LIB_DIR) $< -o $(BASENAME).elf -D$(TARGET) -L. -lplatform -mmcu=$(TARGET)

$(BASENAME).dis: $(BASENAME).elf
	avr-objdump -S $(BASENAME).elf > $(BASENAME).hex.dis

$(BASENAME).hex: $(BASENAME).elf
	avr-objcopy -I elf32-avr -O ihex $(BASENAME).elf $(BASENAME).hex

$(BASENAME).bin: $(BASENAME).elf
	avr-objcopy -I elf32-avr -O binary $(BASENAME).elf $(BASENAME).bin

.PHONY $(TARGET).html: $(BASENAME).hex
	echo 'var target = "$(TARGET)";' > js/scratch.js
ifeq ($(DROPBOX),yes)
	echo 'var useDropbox = (typeof Dropbox != "undefined");' >> js/scratch.js
else
	echo 'var useDropbox = false;' >> js/scratch.js
endif
	cat js/$(TARGET)_port_supplier.js >> js/scratch.js
ifeq ($(TARGET),atmega328)
	echo 'forceOptimizationEnabled = true;' >> js/scratch.js
	echo 'optimize.style.display = "none";' >> js/scratch.js
endif

android: $(TARGET).html
ifeq ($(TARGET),atmega328)
	-@mkdir android/src/org/starlo/boardmicro/gamebuino
	cp -f android/GamebuinoAndroidManifest.xml android/AndroidManifest.xml
	ln -f android/GamebuinoActivity.java android/src/org/starlo/boardmicro/gamebuino/GamebuinoActivity.java
else
	cp -f android/BoardMicroAndroidManifest.xml android/AndroidManifest.xml
	ln -f android/BoardMicroActivity.java android/src/org/starlo/boardmicro/BoardMicroActivity.java
	ln -f android/DebugActivity.java android/src/org/starlo/boardmicro/DebugActivity.java
endif
	echo '<script type="text/javascript">var target = "$(TARGET)";</script>' >> $@.html;
	echo '<script>' >> $@.html
	cat js/elfcore.js >> $@.html
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

desktop.js: $(BASENAME).hex
	cat js/avrcore.js > $@
	cat js/emcc_avrcore.js >> $@
	cat js/libdesktop.js >> $@
	echo 'var target = "$(TARGET)";' >> $@;

upload: $(BASENAME).hex
	python reset.py /dev/ttyACM0
	sleep 2
	avrdude -c avr109 -p$(TARGET) -P/dev/ttyACM0 -Uflash:w:$<:i -b 57600

clean: 
	-@rm *.elf *.dis *.hex android.html *.o *.a *.bin *.js android/assets/avrcore.html js/scratch.js
	cd android; ant clean
	-@rm android/AndroidManifest.xml
	-@rm android/src/org/starlo/boardmicro/BoardMicroActivity.java
	-@rm android/src/org/starlo/boardmicro/gamebuino/GamebuinoActivity.java
	-@rm android/src/org/starlo/boardmicro/DebugActivity.java
