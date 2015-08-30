arduboy: main.cpp
	g++ -std=c++11 $< -o $@ `pkg-config --cflags --libs gtk+-2.0` -L. -lsimavr -lpthread -lelf

clean:
	-@rm arduboy
