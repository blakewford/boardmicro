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
