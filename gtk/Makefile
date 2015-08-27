arduboy: main.c
	gcc -std=c99 $< -o $@ `pkg-config --cflags --libs gtk+-2.0` -L. -lsimavr -lpthread

clean:
	-@rm arduboy
