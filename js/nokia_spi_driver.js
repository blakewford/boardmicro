var x=0, y=0;
function peripheralSPIWrite(a) {
  var LCDHEIGHT_NOROT = 48;
  var LCDWIDTH_NOROT = 84;
  var PCD8544_SETYADDR = 0x40;
  var PCD8544_SETXADDR = 0x80;
  if(readMemory(portC) == 5)
  {
      for(var i=0; i < 8; i++)
      {
        var bit = a & (1 << i);
        var color = bit == 0 ? "#000000":"#FFFFFF"
        drawPixel(x, y+i, color);
        writeMemory(32758+i, bit);
      }
      writeMemory(32766, x);
      x++;
  }
  if(a >= PCD8544_SETYADDR && a <= PCD8544_SETYADDR+5 && (readMemory(portC) == 1))
  {
      y = (a - PCD8544_SETYADDR)*8;
  }
  if(a == PCD8544_SETXADDR && (readMemory(portC) == 1))
  {
      //writeMemory(32767, 0);
      x = 0;
  }
}
