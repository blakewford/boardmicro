var screenDataOffset = 0;
function writeDMARegion(c, b) {
  if (c == DMA || c == DMA + 1) {
    screenDataOffset = -1;
  } else {
    if (c == DMA + 9 || c == DMA + 8) {
      var d = memory[DMA + 1] << 8 | memory[DMA], h = memory[DMA + 3] << 8 | memory[DMA + 2], e = memory[DMA + 5] << 8 | memory[DMA + 4], f = memory[DMA + 7] << 8 | memory[DMA + 6], g = memory[DMA + 9] << 8 | memory[DMA + 8], k;
      k = (8 * (g >> 11) << 16) + (4 * (g >> 5 & 63) << 8);
      k += 8 * (g & 31);
      for (k = k.toString(16);6 > k.length;) {
        k = "0" + k;
      }
      g = "#" + k;
      if(-1 != screenDataOffset)
      {
        drawPixel(d + screenDataOffset, e, g);
        (k = {}, k.x = d + screenDataOffset, k.y = e, k.color = g, pixelQueue.push(k));
      }
      d + screenDataOffset != h ? screenDataOffset++ : (screenDataOffset = 0, e != f && (e++, writeMemory(DMA + 5, e >> 8), writeMemory(DMA + 4, e & 255)));
    }
  }
}

var colset = 0, rowset = 0, datasent = 0;
function peripheralSPIWrite(a) {
  if (0 == (readMemory(portE) & 64) && 0 == (readMemory(portD) & 4)) {
    42 == a ? colset = 4 : 43 == a && (rowset = 4);
  } else {
    if (0 == (readMemory(portE) & 64) && 0 != (readMemory(portD) & 4)) {
      if (0 < colset) {
        optimizationEnabled = !0;
        switch(colset) {
          case 4:
            writeMemory(32759, a);
            break;
          case 3:
            writeMemory(32758, a);
            break;
          case 2:
            writeMemory(32761, a);
            break;
          case 1:
            writeMemory(32760, a);
        }
        colset--;
      } else {
        if (0 < rowset) {
          switch(rowset) {
            case 4:
              writeMemory(32763, a);
              break;
            case 3:
              writeMemory(32762, a);
              break;
            case 2:
              writeMemory(32765, a);
              break;
            case 1:
              writeMemory(32764, a);
          }
          rowset--;
          optimizationEnabled = !1;
        } else {
          0 == datasent % 2 ? writeMemory(32766, a) : writeMemory(32767, a), datasent++;
        }
      }
    }
  }
}

//New API
var videoMemory = new Array(10);
function writeVideoMemory(address, value) {
  videoMemory[address] = value;
  if(address == 0 || address == 1) {
    screenDataOffset = -1;
  } else {
    if(address == 9 || address == 8) {
      var startX = videoMemory[1] << 8 | videoMemory[0];
      var endX = videoMemory[3] << 8 | videoMemory[2];
      var Y = videoMemory[5] << 8 | videoMemory[4];
      var endY = videoMemory[7] << 8 | videoMemory[6];
      var color = videoMemory[9] << 8 | videoMemory[8];

      var colorString = (8 * (color >> 11) << 16) + (4 * (color >> 5 & 63) << 8);
      colorString += 8 * (color & 31);
      for(colorString = colorString.toString(16);6 > colorString.length;) {
        colorString = "0" + colorString;
      }
      color = "#" + colorString;
      if(-1 != screenDataOffset)
      {
        drawPixel(startX + screenDataOffset, Y, color);
        (k = {}, k.x = startX + screenDataOffset, k.y = Y, k.color = color, pixelQueue.push(k));
      }
      startX + screenDataOffset != endX ? screenDataOffset++ : (screenDataOffset = 0, Y != endY && (Y++, videoMemory[5] = (Y >> 8)), videoMemory[4] = (Y & 255));
    }
  }
}

function writeSPI(value) {
  if (0 == (eState & 64) && 0 == (dState & 4)) {
    42 == value ? colset = 4 : 43 == value && (rowset = 4);
  } else {
    if (0 == (eState & 64) && 0 != (dState & 4)) {
      if (0 < colset) {
        optimizationEnabled = !0;
        switch(colset) {
          case 4:
            writeVideoMemory(1, value);
            break;
          case 3:
            writeVideoMemory(0, value);
            break;
          case 2:
            writeVideoMemory(3, value);
            break;
          case 1:
            writeVideoMemory(2, value);
        }
        colset--;
      } else {
        if (0 < rowset) {
          switch(rowset) {
            case 4:
              writeVideoMemory(5, value);
              break;
            case 3:
              writeVideoMemory(4, value);
              break;
            case 2:
              writeVideoMemory(7, value);
              break;
            case 1:
              writeVideoMemory(6, value);
          }
          rowset--;
          optimizationEnabled = !1;
        } else {
          0 == datasent % 2 ? writeVideoMemory(8, value) : writeVideoMemory(9, value), datasent++;
        }
      }
    }
  }
}
