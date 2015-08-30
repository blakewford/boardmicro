#include <stdint.h>

struct spiWrite
{
	uint8_t ports[5];
	uint8_t spi;
};

extern "C" {
void setSPICallback(void (*callback)(struct spiWrite call));
}
