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
