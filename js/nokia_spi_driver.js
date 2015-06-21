function initScreen(){
  var k = {};
  for(var y = 0; y < 48; y++)
  {
    for(var x = 0; x < 84; x++)
    {
      k.x = x;
      k.y = y;
      k.color = "#CCFF66";
      isNative() ? pixelQueue.push(k): drawPixel(k.x, k.y, k.color);
    }
  }
}
var x=0, y=0;
function writeDMARegion(c, b){
  if( c === 32766 ){
    var x = memory[32766];
    for(var i = 0; i < 8; i++)
    {
      var base = y+i;
      var color = memory[32758+i] === 0 ? "#CCFF66": "#293314";
      drawPixel( x, base, color );
      var k = {};
      k.x = x;
      k.y = base;
      k.color = color;
      pixelQueue.push(k);
    }
  }
}
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
        writeMemory(32758+i, bit);
      }
      writeMemory(32766, x++);
  }
  if(a >= PCD8544_SETYADDR && a <= PCD8544_SETYADDR+5 && (readMemory(portC) == 1))
  {
      y = (a - PCD8544_SETYADDR)*8;
  }
  if(a == PCD8544_SETXADDR && (readMemory(portC) == 1))
  {
      writeMemory(32766, 0);
      x = 0;
  }
}

//New API
var videoMemory = new Array(9);
function writeVideoMemory(address, value) {
  videoMemory[address] = value;
  if(address === 8){
    var x = videoMemory[8];
    for(var i = 0; i < 8; i++)
    {
      var base = y+i;
      var color = videoMemory[i] === 0 ? "#CCFF66": "#293314";
      drawPixel( x, base, color );
      var k = {};
      k.x = x;
      k.y = base;
      k.color = color;
      pixelQueue.push(k);
    }
  }
}

function writeSPI(value) {
  var LCDHEIGHT_NOROT = 48;
  var LCDWIDTH_NOROT = 84;
  var PCD8544_SETYADDR = 0x40;
  var PCD8544_SETXADDR = 0x80;
  if(cState & 0x5)
  {
      for(var i=0; i < 8; i++)
      {
        var bit = value & (1 << i);
        writeVideoMemory(i, bit);
      }
      writeVideoMemory(8, x++);
  }
  if(value >= PCD8544_SETYADDR && value <= PCD8544_SETYADDR+5 && (cState & 0x1) && !(cState & 0x4))
  {
      y = (value - PCD8544_SETYADDR)*8;
  }
  if(value == PCD8544_SETXADDR && (cState & 0x1) && !(cState & 0x4))
  {
      writeVideoMemory(8, 0);
      x = 0;
  }
}
