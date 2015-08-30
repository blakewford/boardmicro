#include <stdint.h>

struct spiWrite
{
	uint8_t ports[5];
	uint8_t spi;
};

extern "C" {
void loadPartialProgram(uint8_t* binary);
void engineInit(const char* m);
int32_t fetchN(int32_t n);
void buttonHit(int r, int v);
void setSPICallback(void (*callback)(struct spiWrite call));
}
