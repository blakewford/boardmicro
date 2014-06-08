/* AVR simulation code for pichai.

 This file is part of pichai.

 pichai is free software; you can redistribute it and/or modify it under
 the terms of the GNU General Public License as published by the Free
 Software Foundation; either version 3, or (at your option) any later
 version.

 pichai is distributed in the hope that it will be useful, but WITHOUT ANY
 WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 for more details.

 You should have received a copy of the GNU General Public License
 along with pichai; see the file LICENSE.  If not see
 <http://www.gnu.org/licenses/>.  */
var ADCSRA = 0x7A, ADCH = 0x79, ADCL = 0x78, SP = 95, SPH = 94, SPL = 93, r = Array(32), calculatedOffset = 0, SREG, C = 0, Z = 0, N = 0, V = 0, S = 0, H = 0, T = 0, I = 0, dataQueueB = [], dataQueueC = [], dataQueueD = [], dataQueueE = [], dataQueueF = [], pixelQueue = [], softBreakpoints = [], isPaused = !0, forceBreak = !1, hasDeviceSignature = !1, simulationManufacturerID = 191, uartBufferLength = 32, sdr, spsr, udr, ucsra, ucsrb, udri, memory, flashStart, dataStart, dataEnd, ioRegStart, portB, portC, portD, portE, portF, pllCsr, bitsPerPort, 
vectorBase, usbVectorBase, signatureOffset, jumpTableAddress, mainAddress, PC, optimizationEnabled, forceOptimizationEnabled = !1, batchSize = 1E3, batchDelay = 0, adcValue = 9, disableHardware = false;
function peripheralSPIWrite(c) {
}
function uartWrite(c) {
}
function drawPixel(c, b, e) {
}
function popPortBuffer(c, b) {
  if(isNode())
      console.log(c[0]);
  c.shift();
}
function setPin(c, b) {
}
function initCore() {
  "attiny4" === target ? (memory = Array(17408), flashStart = 16384, dataStart = 64, dataEnd = 96, ioRegStart = 0, portB = 2, spr = 16894, udr = 16895, bitsPerPort = 4, SPH = 62, SPL = 61, spsr = udri = ucsra = ucsrb = spmCr = pllCsr = portF = portE = portD = portC = 57005) : "atmega8" === target ? (memory = Array(8192), flashStart = 1120, dataStart = 96, dataEnd = 1120, ioRegStart = 32, portB = 56, portC = 53, portD = 50, spmCr = 87, sdr = 47, spsr = 46, udr = 44, udri = 24, ucsra = 43, ucsrb = 
  42, bitsPerPort = 8, pllCsr = portF = portE = 57005) : "atmega32u4" === target ? (memory = Array(32768), flashStart = 2816, dataStart = 256, dataEnd = 2816, ioRegStart = 32, portB = 37, portC = 40, portD = 43, portE = 46, portF = 49, spmCr = 87, sdr = 78, spsr = 77, udr = 206, udri = 104, ucsra = 200, ucsrb = 201, pllCsr = 73, bitsPerPort = 8, SP = 2815, DMA = 32758) : alert("Failed! Unknown target");
  optimizationEnabled = !1;
  PC = flashStart;
  SREG = ioRegStart + 63;
  vectorBase = flashStart + 172;
  usbVectorBase = vectorBase + 430;
  signatureOffset = flashStart + 176;
  jumpTableAddress = usbVectorBase + 64;
  mainAddress = usbVectorBase + 72;
  for (a = 0;a < memory.length;a++) {
    disableHardware = true;
    a != sdr && writeMemory(a, 0);
    disableHardware = false;
  }
  memory[ucsra] = 32;
  memory[ucsrb] = 32;
  memory[spsr] = 128;
  "attiny4" === target && (memory[16320] = simulationManufacturerID, memory[16321] = 143, memory[16322] = 10);
}
function writeClockRegister(c) {
  memory[pllCsr] = 0 < (c & 2) ? memory[pllCsr] | 1 : memory[pllCsr] & 254;
}
function writeControlRegister(c) {
  33 === c && writeMemory((r[31] << 8 | r[30]) + flashStart, simulationManufacturerID.toString(16));
  memory[spmCr] = c;
}
function isNative() {
  return !isNode() && -1 != navigator.userAgent.indexOf("NativeApp");
}
function isNode() {
  return typeof navigator === 'undefined';
}
function writeADCDataRegister(c) {
  if(isNative()){
    adcValue = c;
  }
}
function writeUARTDataRegister(c) {
  memory[udr] = c;
  uartWrite(c);
  isNative() && Android.writeUARTBuffer(c);
}
function writeSPIDataRegister(c) {
  memory[sdr] = c;
  peripheralSPIWrite(c);
}
function callUARTInterrupt() {
  writeMemory(SP--, PC >> 8);
  writeMemory(SP--, PC & 255);
  PC = udri + flashStart;
}
function writeSpecificPort(c) {
  var b, e = 8 * c;
  switch(c) {
    case 0:
      b = dataQueueB;
      isNode() && console.log("PortB");
      break;
    case 1:
      b = dataQueueC;
      isNode() && console.log("PortC");
      break;
    case 2:
      b = dataQueueD;
      isNode() && console.log("PortD");
      break;
    case 3:
      b = dataQueueE;
      isNode() && console.log("PortE");
      break;
    case 4:
      b = dataQueueF;
      isNode() && console.log("PortF");
  }
  isNative() && !(forceOptimizationEnabled && (e == 16 || e == 24)) && Android.writePort(c, b[0]);
  popPortBuffer(b, e);
}
var screenDataOffset = 0;
function writeDMARegion(c, b) {
  if (c == DMA || c == DMA + 1) {
    screenDataOffset = -1;
  } else {
    if (c == DMA + 9 || c == DMA + 8) {
      var e = memory[DMA + 1] << 8 | memory[DMA], h = memory[DMA + 3] << 8 | memory[DMA + 2], d = memory[DMA + 5] << 8 | memory[DMA + 4], f = memory[DMA + 7] << 8 | memory[DMA + 6], g = memory[DMA + 9] << 8 | memory[DMA + 8];
      var color = ((g >> 11)*8) << 16;
      color += (((g >> 5) & 0x3F)*4) << 8;
      color += ((g & 0x1F)*8);
      color = color.toString(16);
      while( color.length < 6)
          color = "0"+color;
      g = "#"+color;
      if (-1 != screenDataOffset && (drawPixel(e + screenDataOffset, d, g), isNative())) {
        var k = {};
        k.x = e + screenDataOffset;
        k.y = d;
        k.color = g;
        pixelQueue.push(k);
      }
      e + screenDataOffset != h ? screenDataOffset++ : (screenDataOffset = 0, d != f && (d++, writeMemory(DMA + 5, d >> 8), writeMemory(DMA + 4, d & 255)));
    }
  }
}
function writeMemory(c, b) {
  memory[c] = b;
  if(!disableHardware)
  {
      c == portB && dataQueueB.push(b);
      c == portC && dataQueueC.push(b);
      c == portD && dataQueueD.push(b);
      c == portE && dataQueueE.push(b);
      c == portF && dataQueueF.push(b);
      c == udr && writeUARTDataRegister(b);
      c == sdr && writeSPIDataRegister(b);
      c == ucsra && memory[ucsrb] & 32 && b & 64 && callUARTInterrupt();
      c >= DMA && writeDMARegion(c, b);
  }
  c == pllCsr && writeClockRegister(b);
  c == spmCr && writeControlRegister(b);
  if (c == SPH || c == SPL) {
    SP = memory[SPH] << 8 | memory[SPL];
  }
}
function readMemory(c) {
  if(c === ADCH && isNative())
      Android.updateADCRegister();
  return c === SREG ? C | Z << 1 | N << 2 | V << 3 | S << 4 | H << 5 | T << 6 | I << 7 : c === SPH ? SP >> 8 : c === SPL ? SP & 255 : c === ADCL ? adcValue & 0xFF : c === ADCH ? adcValue >> 8 : memory[c];
}
function loadMemory(c, b) {
  initCore();
  c = b ? c.split(/["|"]/) : c.split(/["\n"]/);
  for (var e = 0;c[e];) {
    var h = c[e].substring(1), d = parseInt(h.substring(2, 6), 16), f = 0;
    for (j = 4;j < parseInt(h.substring(0, 2), 16) + 4;j += 2) {
      var g = 2 * j, g = h.substring(g, g + 4);
      writeMemory(flashStart + d + f, g.substring(0, 2));
      writeMemory(flashStart + d + f + 1, g.substring(2));
      f += 2;
    }
    e++;
  }
}
function setPreEvaluationFlags(c, b) {
  H = 15 < c + b ? 1 : 0;
}
function setPostEvaluationFlags(c) {
  255 < c ? (C = 1, c &= 255) : C = 0;
  Z = 0 === c ? 1 : 0;
  N = 128 === (128 & c) || 0 > c ? 1 : 0;
  V = 127 < c ? 1 : 0;
  S = N ^ V;
}
function getBreakDistance(c, b) {
  return(c & 3) << 5 | (b & 240) >> 3 | (b & 8) >> 3;
}
function getRegister(c, b) {
  return ioRegStart + ((b & 248) >> 3);
}
function getRegisterValue(c, b) {
  return b & 7;
}
function getIOValue(c, b) {
  return ioRegStart + ((c & 6) >> 1 << 4 | b & 15);
}
function getJumpConstant(c, b) {
  return(c & 15) << 8 | b;
}
function getBigConstant(c, b) {
  return(c & 15) << 4 | b & 15;
}
function getSmallDestinationRegister(c, b) {
  return((b & 240) >> 4) + 16;
}
function getSmallSourceRegister(c, b) {
  return(b & 15) + 16;
}
function getConstant(c, b) {
  return(b & 192) >> 2 | b & 15;
}
function getUpperPair(c, b) {
  return 2 * ((b & 48) >> 4) + 24;
}
function getDisplacement(c, b) {
  return c & 32 | (c & 12) << 1 | b & 7;
}
function fetch(c, b) {
  var e = 16 * (c & 1) + ((b & 240) >> 4), h = 16 * ((c & 2) >> 1) + (b & 15);
  switch(c) {
    case 0:
      break;
    case 1:
      var d = 2 * ((b & 240) >> 4), f = 2 * (b & 15);
      r[d] = r[f];
      r[d + 1] = r[f + 1];
      break;
    case 2:
    ;
    case 3:
      var f = getSmallDestinationRegister(c, b), g = getSmallSourceRegister(c, b), d = !1;
      3 === c && (d = 24 <= f || 24 <= g, f &= 23, g &= 23);
      f = r[f] * r[g];
      d && (f >>= 1);
      r[0] = f & 255;
      r[1] = (f & 65280) >> 8;
      break;
    case 4:
    ;
    case 5:
    ;
    case 6:
    ;
    case 7:
      H = 0;
      d = Z;
      f = r[e] - r[h] - C;
      var cache = C;
      setPostEvaluationFlags(f);
      Z = 0 === f ? d : 0;
      C = Math.abs(r[h]+cache) > Math.abs(r[e]);
      break;
    case 8:
    ;
    case 9:
    ;
    case 10:
    ;
    case 11:
      setPreEvaluationFlags(r[e], r[h]);
      r[e] = r[e] - r[h] - C;
      var cache = C;
      setPostEvaluationFlags(f);
      setPostEvaluationFlags(r[e]);
      C = Math.abs(r[h]+cache) > Math.abs(r[e]);
      break;
    case 12:
    ;
    case 13:
    ;
    case 14:
    ;
    case 15:
      setPreEvaluationFlags(r[e], r[h]);
      r[e] += r[h];
      setPostEvaluationFlags(r[e]);
      break;
    case 16:
    ;
    case 17:
    ;
    case 18:
    ;
    case 19:
      r[e] === r[h] && (PC += 2, d = parseInt(memory[PC - 2], 16), f = parseInt(memory[PC - 1], 16), 12 <= d && 148 == f | 149 == f && (PC += 2), 16 <= d | 0 == d && 144 == f | 145 == f && (PC += 2), 16 <= d | 0 == d && 146 == f | 147 == f && (PC += 2));
      break;
    case 20:
    ;
    case 21:
    ;
    case 22:
    ;
    case 23:
      setPreEvaluationFlags(r[e], r[h]);
      setPostEvaluationFlags(r[e] - r[h]);
      C = Math.abs(r[h]) > Math.abs(r[e]);
      break;
    case 24:
    ;
    case 25:
    ;
    case 26:
    ;
    case 27:
      setPreEvaluationFlags(r[e], r[h]);
      r[e] -= r[h];
      r[e] < 0 ? (r[e]+=0xFF, C=1): C=0;
      var cache = C;
      setPostEvaluationFlags(r[e]);
      C = cache;
      break;
    case 28:
    ;
    case 29:
    ;
    case 30:
    ;
    case 31:
      setPreEvaluationFlags(r[e], r[h]);
      r[e] = r[e] + r[h] + C;
      setPostEvaluationFlags(r[e]);
      break;
    case 32:
    ;
    case 33:
    ;
    case 34:
    ;
    case 35:
      H = 0;
      r[e] &= r[h];
      setPostEvaluationFlags(r[e]);
      V = C = 0;
      S = N ^ V;
      break;
    case 36:
    ;
    case 37:
    ;
    case 38:
    ;
    case 39:
      r[e] ^= r[h];
      break;
    case 40:
    ;
    case 41:
    ;
    case 42:
    ;
    case 43:
      r[e] |= r[h];
      break;
    case 44:
    ;
    case 45:
    ;
    case 46:
    ;
    case 47:
      r[e] = r[h];
      break;
    case 48:
    ;
    case 49:
    ;
    case 50:
    ;
    case 51:
    ;
    case 52:
    ;
    case 53:
    ;
    case 54:
    ;
    case 55:
    ;
    case 56:
    ;
    case 57:
    ;
    case 58:
    ;
    case 59:
    ;
    case 60:
    ;
    case 61:
    ;
    case 62:
    ;
    case 63:
      H = 0;
      setPostEvaluationFlags(r[getSmallDestinationRegister(c, b)] - getBigConstant(c, b));
      C = Math.abs(getBigConstant(c, b)) > Math.abs(r[getSmallDestinationRegister(c, b)]);
      break;
    case 64:
    ;
    case 65:
    ;
    case 66:
    ;
    case 67:
    ;
    case 68:
    ;
    case 69:
    ;
    case 70:
    ;
    case 71:
    ;
    case 72:
    ;
    case 73:
    ;
    case 74:
    ;
    case 75:
    ;
    case 76:
    ;
    case 77:
    ;
    case 78:
    ;
    case 79:
      d = getBigConstant(c, b);
      f = getSmallDestinationRegister(c, b);
      for (0 < r[f] ^ 0 < d && (r[f] = r[f] - d - C);0 > r[f];) {
        r[f] = 256 + r[f];
      }
      C = Math.abs(r[f]) < d + C;
      break;
    case 80:
    ;
    case 81:
    ;
    case 82:
    ;
    case 83:
    ;
    case 84:
    ;
    case 85:
    ;
    case 86:
    ;
    case 87:
    ;
    case 88:
    ;
    case 89:
    ;
    case 90:
    ;
    case 91:
    ;
    case 92:
    ;
    case 93:
    ;
    case 94:
    ;
    case 95:
      f = getSmallDestinationRegister(c, b);
      r[f] -= getBigConstant(c, b);
      for (C = 0;0 > r[f];) {
        r[f] = 256 + r[f], C = 1;
      }
      break;
    case 96:
    ;
    case 97:
    ;
    case 98:
    ;
    case 99:
    ;
    case 100:
    ;
    case 101:
    ;
    case 102:
    ;
    case 103:
    ;
    case 104:
    ;
    case 105:
    ;
    case 106:
    ;
    case 107:
    ;
    case 108:
    ;
    case 109:
    ;
    case 110:
    ;
    case 111:
      f = getSmallDestinationRegister(c, b);
      r[f] |= getBigConstant(c, b);
      break;
    case 112:
    ;
    case 113:
    ;
    case 114:
    ;
    case 115:
    ;
    case 116:
    ;
    case 117:
    ;
    case 118:
    ;
    case 119:
    ;
    case 120:
    ;
    case 121:
    ;
    case 122:
    ;
    case 123:
    ;
    case 124:
    ;
    case 125:
    ;
    case 126:
    ;
    case 127:
      H = 0;
      f = getSmallDestinationRegister(c, b);
      r[f] &= getBigConstant(c, b);
      setPostEvaluationFlags(r[f]);
      C = 0;
      break;
    case 128:
    ;
    case 129:
      if (8 <= (b & 15)) {
        r[e] = readMemory((r[29] << 8 | r[28]) + getDisplacement(c, b));
        break;
      }
      if (8 > (b & 15) && 0 <= (b & 15)) {
        r[e] = readMemory((r[31] << 8 | r[30]) + getDisplacement(c, b));
        break;
      }
      0 === (b & 15) ? r[e] = readMemory(r[31] << 8 | r[30]) : r[e] = readMemory(r[29] << 8 | r[28]);
      break;
    case 130:
    ;
    case 131:
      if (8 <= (b & 15)) {
        writeMemory((r[29] << 8 | r[28]) + getDisplacement(c, b), r[e]);
        break;
      }
      if (8 > (b & 15) && 0 <= (b & 15)) {
        writeMemory((r[31] << 8 | r[30]) + getDisplacement(c, b), r[e]);
        break;
      }
      8 === (b & 15) && writeMemory(r[29] << 8 | r[28], r[e]);
      0 === (b & 15) && writeMemory(r[31] << 8 | r[30], r[e]);
      break;
    case 132:
    ;
    case 133:
    ;
    case 136:
    ;
    case 137:
    ;
    case 140:
    ;
    case 141:
      if (8 <= (b & 15)) {
        r[e] = readMemory((r[29] << 8 | r[28]) + getDisplacement(c, b));
        break;
      }
      if (8 > (b & 15) && 0 <= (b & 15)) {
        r[e] = readMemory((r[31] << 8 | r[30]) + getDisplacement(c, b));
        break;
      }
      break;
    case 134:
    ;
    case 135:
    ;
    case 138:
    ;
    case 139:
    ;
    case 142:
    ;
    case 143:
      if (8 <= (b & 15)) {
        writeMemory((r[29] << 8 | r[28]) + getDisplacement(c, b), r[e]);
        break;
      }
      if (8 > (b & 15) && 0 <= (b & 15)) {
        writeMemory((r[31] << 8 | r[30]) + getDisplacement(c, b), r[e]);
        break;
      }
      break;
    case 144:
    ;
    case 145:
      15 === (b & 15) ? r[e] = readMemory(++SP) : 4 === (b & 15) || 5 === (b & 15) ? (d = r[31] << 8 | r[30], g = 2 * (d >> 1) + flashStart, f = parseInt(readMemory(g), 16), g = parseInt(readMemory(g + 1), 16), r[e] = 0 === (d & 1) ? f : g, 5 === (b & 15) && (r[30]++, 256 === r[30] && (r[30] = 0, r[31]++))) : 1 === (b & 15) ? (r[e] = readMemory(r[31] << 8 | r[30]), r[30] += 1, 256 == r[30] && (r[30] = 0, r[31] += 1)) : 2 === (b & 15) ? (r[30] -= 1, 0 > r[30] && (r[30] = 0, r[31] -= 1), r[e] = readMemory(r[31] << 
      8 | r[30])) : 13 === (b & 15) ? (r[e] = readMemory(r[27] << 8 | r[26]), r[26] += 1, 256 == r[26] && (r[26] = 0, r[27] += 1)) : 14 === (b & 15) ? (r[26] -= 1, 0 > r[26] && (r[26] = 0, r[27] -= 1), r[e] = readMemory(r[27] << 8 | r[26])) : r[e] = 12 === (b & 15) ? readMemory(r[27] << 8 | r[26]) : readMemory(parseInt(readMemory(PC++), 16) | parseInt(readMemory(PC++), 16) << 8);
      break;
    case 146:
    ;
    case 147:
      1 === (b & 15) && (writeMemory(r[31] << 8 | r[30], r[e]), r[30] += 1, 256 == r[30] && (r[30] = 0, r[31] += 1));
      2 === (b & 15) && (r[30] -= 1, 0 > r[30] && (r[30] = 255, r[31] -= 1), writeMemory(r[31] << 8 | r[30], r[e]));
      9 === (b & 15) && (writeMemory(r[29] << 8 | r[28], r[e]), r[28] += 1, 256 == r[28] && (r[28] = 0, r[29] += 1));
      10 === (b & 15) && (r[28] -= 1, 0 > r[28] && (r[28] = 255, r[29] -= 1), writeMemory(r[29] << 8 | r[28], r[e]));
      14 === (b & 15) && (r[26] -= 1, 0 > r[26] && (r[26] = 255, r[27] -= 1), writeMemory(r[27] << 8 | r[26], r[e]));
      15 === (b & 15) ? (writeMemory(SP, r[e]), SP--) : 0 === (b & 15) ? writeMemory(parseInt(memory[PC++], 16) | parseInt(memory[PC++], 16) << 8, r[e]) : 12 === (b & 15) ? (d = parseInt(r[26]), f = parseInt(r[27]) << 8, writeMemory(f | d, r[e])) : 13 === (b & 15) && (d = parseInt(r[26]), f = parseInt(r[27]) << 8, writeMemory(f | d, r[e]), r[26]++, 256 === r[26] && (r[26] = 0, r[27]++));
      break;
    case 148:
    ;
    case 149:
      0 === (b & 15) && (r[e] = 255 - r[e], C = 1);
      if (7 === (b & 15)) {
        d = r[e] & 1, r[e] >>= 1, C && (r[e] |= 128), C = d;
      } else {
        if (2 === (b & 255)) {
          r[e] = r[e] << 4 | r[e] >> 4;
        } else {
          if (3 === (b & 255)) {
            r[e] += 1;
          } else {
            if (5 === (b & 255)) {
              d = r[e], g = d & 1, d = d >> 1 | d & 128, setPostEvaluationFlags(d), r[e] = d, C = g, V = N ^ C;
            } else {
              if (6 === (b & 15)) {
                C = r[e] & 1, r[e] >>= 1;
              } else {
                if (8 === (b & 255) && 148 === c) {
                  C = 1;
                } else {
                  if (9 === (b & 255) && 148 === c) {
                    PC = 2 * (r[31] << 8 | r[30]) + flashStart;
                  } else {
                    if (24 === (b & 255) && 148 === c) {
                      Z = 1;
                    } else {
                      if (40 === (b & 255) && 148 === c) {
                        N = 1;
                      } else {
                        if (56 === (b & 255) && 148 === c) {
                          V = 1;
                        } else {
                          if (72 === (b & 255) && 148 === c) {
                            S = 1;
                          } else {
                            if (88 === (b & 255) && 148 === c) {
                              H = 1;
                            } else {
                              if (104 === (b & 255) && 148 === c) {
                                T = 1;
                              } else {
                                if (120 === (b & 255) && 148 === c) {
                                  I = 1;
                                } else {
                                  if (136 === (b & 255) && 148 === c) {
                                    C = 0;
                                  } else {
                                    if (152 === (b & 255) && 148 === c) {
                                      Z = 0;
                                    } else {
                                      if (168 === (b & 255) && 148 === c) {
                                        N = 0;
                                      } else {
                                        if (184 === (b & 255) && 148 === c) {
                                          V = 0;
                                        } else {
                                          if (200 === (b & 255) && 148 === c) {
                                            S = 0;
                                          } else {
                                            if (216 === (b & 255) && 148 === c) {
                                              H = 0;
                                            } else {
                                                if (232 === (b & 255) && 148 === c) {
                                                  T = 0;
                                                } else {
                                                  if (248 === (b & 255) && 148 === c) {
                                                    I = 0;
                                                  } else {
                                                    if (8 === (b & 255) && 149 === c) {
                                                      f = memory[++SP], PC = f << 8 | memory[++SP];
                                                    } else {
                                                      if (136 === (b & 255) && 149 === c) {
                                                        break;
                                                      } else {
                                                        if (168 === (b & 255) && 149 === c) {
                                                          break;
                                                        } else {
                                                          9 === (b & 255) ? (writeMemory(SP--, PC & 255), writeMemory(SP--, PC >> 8), PC = 2 * (r[31] << 8 | r[30]) + flashStart) : 10 === (b & 15) ? (r[e] -= 1, Z = r[e] == 0) : 12 === (b & 15) || 13 === (b & 15) ? PC = flashStart + 2 * ((c & 1) << 20 | (b & 240) << 17 | (b & 1) << 16 | parseInt(memory[PC + 1], 16) << 8 | parseInt(memory[PC], 16)) : 14 === (b & 15) || 15 === (b & 15) ? (writeMemory(SP--, PC + 2 & 255), writeMemory(SP--, PC + 2 >> 8), PC = flashStart + 
                                                          2 * (parseInt(memory[PC + 1], 16) << 8 | parseInt(memory[PC], 16))) : 24 === (b & 255) && 149 === c && (PC = readMemory(++SP) | readMemory(++SP) << 8);
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
      }
      break;
    case 150:
      H = 0;
      d = getConstant(c, b);
      f = getUpperPair(c, b);
      g = r[f + 1] << 8 | r[f];
      g += d;
      r[f] = g & 255;
      r[f + 1] = g >> 8;
      setPostEvaluationFlags(65535 < g);
      Z = 0 == g;
      break;
    case 151:
      H = 0;
      d = getConstant(c, b);
      f = getUpperPair(c, b);
      g = r[f + 1] << 8 | r[f];
      g -= d;
      r[f] = g & 255;
      r[f + 1] = g >> 8;
      setPostEvaluationFlags(g);
      Z = 0 == g;
      break;
    case 152:
      d = getRegister(c, b);
      f = getRegisterValue(c, b);
      0 < (memory[d] & 1 << f) && writeMemory(d, memory[d] ^ 1 << f);
      break;
    case 153:
      0 == (memory[getRegister(c, b)] & 1 << getRegisterValue(c, b)) && (PC += 2), d = parseInt(memory[PC - 2], 16), f = parseInt(memory[PC - 1], 16), 12 <= d && 148 == f | 149 == f && (PC += 2), 16 <= d | 0 == d && 144 == f | 145 == f && (PC += 2), 16 <= d | 0 == d && 146 == f | 147 == f && (PC += 2);
    case 154:
      d = getRegister(c, b);
      writeMemory(d, memory[d] | 1 << getRegisterValue(c, b));
      break;
    case 155:
      0 < (memory[getRegister(c, b)] & 1 << getRegisterValue(c, b)) && (PC += 2);
      d = parseInt(memory[PC - 2], 16);
      f = parseInt(memory[PC - 1], 16);
      12 <= d && 148 == f | 149 == f && (PC += 2);
      16 <= d | 0 == d && 144 == f | 145 == f && (PC += 2);
      16 <= d | 0 == d && 146 == f | 147 == f && (PC += 2);
      break;
    case 156:
    ;
    case 157:
    ;
    case 158:
    ;
    case 159:
      f = r[e] * r[h];
      r[0] = f & 255;
      r[1] = (f & 65280) >> 8;
      break;
    case 160:
    ;
    case 161:
    ;
    case 164:
    ;
    case 165:
    ;
    case 168:
    ;
    case 169:
    ;
    case 172:
    ;
    case 173:
      8 <= (b & 15) && (r[e] = readMemory((r[29] << 8 | r[28]) + getDisplacement(c, b)));
      8 > (b & 15) && 0 < (b & 15) && (r[e] = readMemory((r[31] << 8 | r[30]) + getDisplacement(c, b)));
      break;
    case 162:
    ;
    case 163:
    ;
    case 166:
    ;
    case 167:
    ;
    case 170:
    ;
    case 171:
    ;
    case 174:
    ;
    case 175:
      8 <= (b & 15) && writeMemory((r[29] << 8 | r[28]) + getDisplacement(c, b), r[e]);
      8 > (b & 15) && 0 < (b & 15) && writeMemory((r[31] << 8 | r[30]) + getDisplacement(c, b), r[e]);
      break;
    case 176:
    ;
    case 177:
    ;
    case 178:
    ;
    case 179:
    ;
    case 180:
    ;
    case 181:
    ;
    case 182:
    ;
    case 183:
      r[e] = readMemory(getIOValue(c, b));
      break;
    case 184:
    ;
    case 185:
    ;
    case 186:
    ;
    case 187:
    ;
    case 188:
    ;
    case 189:
    ;
    case 190:
    ;
    case 191:
      writeMemory(getIOValue(c, b), r[e]);
      break;
    case 192:
    ;
    case 193:
    ;
    case 194:
    ;
    case 195:
    ;
    case 196:
    ;
    case 197:
    ;
    case 198:
    ;
    case 199:
    ;
    case 200:
    ;
    case 201:
    ;
    case 202:
    ;
    case 203:
    ;
    case 204:
    ;
    case 205:
    ;
    case 206:
    ;
    case 207:
      d = getJumpConstant(c, b);
      PC = 2048 === (d & 2048) ? PC - (4096 - 2 * (d ^ 2048)) : PC + 2 * d;
      break;
    case 208:
    ;
    case 209:
    ;
    case 210:
    ;
    case 211:
    ;
    case 212:
    ;
    case 213:
    ;
    case 214:
    ;
    case 215:
    ;
    case 216:
    ;
    case 217:
    ;
    case 218:
    ;
    case 219:
    ;
    case 220:
    ;
    case 221:
    ;
    case 222:
    ;
    case 223:
      writeMemory(SP--, PC & 255);
      writeMemory(SP--, PC >> 8);
      d = getJumpConstant(c, b);
      PC = 2048 === (d & 2048) ? PC - (4096 - 2 * (d ^ 2048)) : PC + 2 * d;
      break;
    case 224:
    ;
    case 225:
    ;
    case 226:
    ;
    case 227:
    ;
    case 228:
    ;
    case 229:
    ;
    case 230:
    ;
    case 231:
    ;
    case 232:
    ;
    case 233:
    ;
    case 234:
    ;
    case 235:
    ;
    case 236:
    ;
    case 237:
    ;
    case 238:
    ;
    case 239:
      r[getSmallDestinationRegister(c, b)] = getBigConstant(c, b);
      break;
    case 240:
    ;
    case 241:
    ;
    case 242:
    ;
    case 243:
      d = !1;
      switch(b & 7) {
        case 0:
          d = C;
          break;
        case 1:
          d = Z;
          break;
        case 3:
          d = V;
          break;
        case 4:
          d = S;
          break;
        case 5:
          d = H;
          break;
        case 6:
          d = T;
      }
      d && (d = getBreakDistance(c, b), PC = 64 < d ? PC - 2 * (128 - d) : PC + 2 * d);
      break;
    case 244:
    ;
    case 245:
    ;
    case 246:
    ;
    case 247:
      d = !1;
      switch(b & 7) {
        case 0:
          d = !C;
          break;
        case 1:
          d = !Z;
          break;
        case 3:
          d = !V;
          break;
        case 4:
          d = !S;
          break;
        case 5:
          d = !H;
          break;
        case 6:
          d = !T;
      }
      d && (d = getBreakDistance(c, b), PC = 64 < d ? PC - 2 * (128 - d) : PC + 2 * d);
      break;
    case 248:
    ;
    case 249:
      r[e] |= T << (b & 7);
      break;
    case 250:
    ;
    case 251:
      T = 0 < (r[e] & 1 << getRegisterValue(c, b));
      break;
    case 252:
    ;
    case 253:
      0 === (r[e] & 1 << (b & 7)) && (PC += 2);
      d = parseInt(memory[PC - 2], 16);
      f = parseInt(memory[PC - 1], 16);
      12 <= d && 148 == f | 149 == f && (PC += 2);
      16 <= d | 0 == d && 144 == f | 145 == f && (PC += 2);
      16 <= d | 0 == d && 146 == f | 147 == f && (PC += 2);
      break;
    case 254:
    ;
    case 255:
      0 < (r[e] & 1 << (b & 7)) && (PC += 2);
      d = parseInt(memory[PC - 2], 16);
      f = parseInt(memory[PC - 1], 16);
      12 <= d && 148 == f | 149 == f && (PC += 2);
      16 <= d | 0 == d && 144 == f | 145 == f && (PC += 2);
      16 <= d | 0 == d && 146 == f | 147 == f && (PC += 2);
      break;
    default:
      forceBreak = !0, isNode() ? console.log("unknown 0x" + (PC - 2).toString(16).toUpperCase() + " " + c + " " + b): alert("unknown 0x" + (PC - 2).toString(16).toUpperCase() + " " + c + " " + b);
  }
  r[e] &= 255;
  r[h] &= 255;
  memory[ADCSRA] &= 191;
  memory[ucsrb] |= 32;
  memory[spsr] |= 128;
}
function handleBreakpoint(c) {
  if(!isNode())
      alert("Breakpoint at 0x" + c);
  else
      console.log("Breakpoint at 0x" + c);
}
function isSoftBreakpoint(c) {
  for (i = 0;i < softBreakpoints.length;i++) {
    if (softBreakpoints[i] + flashStart === c) {
      return!0;
    }
  }
  return!1;
}
function loop() {
  var c, b = !0;
  for (j = 0;j < batchSize;j++) {
    var e = parseInt(memory[PC++], 16), h = parseInt(memory[PC++], 16), d = 149 == h && 152 == e || isSoftBreakpoint(PC) || forceBreak;
    if (207 == h && 255 == e || d) {
      b = !1, d ? (forceBreak = !1, isPaused = !0, handleBreakpoint((PC - 2).toString(16).toUpperCase())) : isNative() && Android.endProgram();
      if(isNode())
        console.log("Exit "+((r[25] << 8)+r[24]));
    }
    fetch(h, e);
    for (i = 0;5 > i;i++) {
      switch(i) {
        case 0:
          c = dataQueueB;
          break;
        case 1:
          c = dataQueueC;
          break;
        case 2:
          c = dataQueueD;
          break;
        case 3:
          c = dataQueueE;
          break;
        case 4:
          c = dataQueueF;
      }
      for (;0 < c.length;) {
        writeSpecificPort(i);
      }
    }
    if (!b) {
      break;
    }
  }
  0 < pixelQueue.length && (Android.writePixelBuffer(JSON.stringify(pixelQueue)), pixelQueue.length = 0);
  b && setTimeout(loop, batchDelay);
}
function engineInit() {
  for (i = 0;i < r.length;i++) {
    r[i] = 0;
  }
  var c = 0;
  12 === parseInt(memory[flashStart], 16) && (c = flashStart + 2 * (parseInt(memory[flashStart + 3], 16) << 8 | parseInt(memory[flashStart + 2], 16)));
  c > usbVectorBase && (calculatedOffset = c - usbVectorBase);
  c = [];
  for (i = signatureOffset + calculatedOffset;i < signatureOffset + calculatedOffset + 32;i += 2) {
    c.push(String.fromCharCode(parseInt(memory[i], 16)));
  }
  switch(c.toString().replace(/,/g, "")) {
    case "Arduino Micro   ":
      hasDeviceSignature = !0;
  }
}
function exec() {
  isPaused && (isPaused = !1, loop());
}
;
