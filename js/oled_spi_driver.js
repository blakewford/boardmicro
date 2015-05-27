function initScreen(){
  var k = {};
  for(var y = 0; y < 64; y++)
  {
    for(var x = 0; x < 128; x++)
    {
      k.x = x;
      k.y = y;
      k.color = "#000000";
      isNative() ? pixelQueue.push(k): drawPixel(k.x, k.y, k.color);
    }
  }
  writeMemory(pinF, 0x80); //Normally done through software in driver initialization
}

function writeDMARegion(c, b){
}

var x=0, y=0;
function peripheralSPIWrite(data) {
  if(readMemory(portD) == 0x50)
  {
    for(var i = 0; i < 8; i++)
    {
      var base = y+i;
      var color = (data & (1 << i)) === 0 ? "#000000": "#FFFFFF";
      drawPixel(x, base, color);
      var k = {};
      k.x = x;
      k.y = base;
      k.color = color;
      pixelQueue.push(k);
    }
    x++;
    if(x == 128)
    {
        x = 0;
        y+=8;
        if(y == 64)
        {
            y = 0;
        }
    }
  }
}

//New API
function writeVideoMemory(address, value) {
}

function writeSPI(value) {
    peripheralSPIWrite(value);
}
