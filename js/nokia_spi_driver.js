var x=0, y=0;
var IsImportant = false;
fillScreen("#FFFFFF");
function peripheralSPIWrite(a) {
  var LCDHEIGHT_NOROT = 48;
  var LCDWIDTH_NOROT = 84;
  var PCD8544_SETYADDR = 0x40;
  var PCD8544_SETXADDR = 0x80;
  if(IsImportant && a != PCD8544_SETXADDR && (a < PCD8544_SETYADDR || a > PCD8544_SETYADDR+5))
  {
      for(var i=0; i < 8; i++)
      {
        var bit = a & (1 << i);
        var color = bit == 0 ? "#000000":"#FFFFFF"
        drawPixel(x, y+i, color);
      }
      x++;
      if(x == LCDWIDTH_NOROT)
        x = 0;
  }
  if(a == PCD8544_SETYADDR)
  {
      IsImportant=!IsImportant;
  }
  if(a >= PCD8544_SETYADDR && a <= PCD8544_SETYADDR+5)
  {
      y = (a - PCD8544_SETYADDR)*8;
  }
}
