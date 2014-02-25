#include "platform.h"
int main(){
    platformBasedDisplayBegin();
    platformBasedDisplaySetPixel(0, 0, 0x001F);
    return 0;
}
