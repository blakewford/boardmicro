#include "platform.h"
int main(){
    platformBasedDisplayBegin();
    platformBasedDisplayBackground(0x001F);
    platformBasedSerialWrite('P');
    return 0;
}
