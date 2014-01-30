/* AVR simulation code for jAVRscript.

 This file is part of jAVRscript.

 jAVRscript is free software; you can redistribute it and/or modify it under
 the terms of the GNU General Public License as published by the Free
 Software Foundation; either version 3, or (at your option) any later
 version.

 jAVRscript is distributed in the hope that it will be useful, but WITHOUT ANY
 WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 for more details.

 You should have received a copy of the GNU General Public License
 along with jAVRscript; see the file LICENSE.  If not see
 <http://www.gnu.org/licenses/>.  */
var SP = 95,
    r = Array(32),
    calculatedOffset = 0,
    SREG, C = 0,
    Z = 0,
    N = 0,
    V = 0,
    S = 0,
    H = 0,
    T = 0,
    I = 0,
    dataQueueB = [],
    dataQueueC = [],
    dataQueueD = [],
    dataQueueE = [],
    dataQueueF = [],
    softBreakpoints = [],
    isPaused = !0,
    forceBreak = !1,
    hasDeviceSignature = !1,
    memory, flashStart, dataStart, dataEnd, ioRegStart, portB, portC, portD, portE, portF, pllCsr, bitsPerPort, vectorBase, usbVectorBase, signatureOffset, jumpTableAddress, mainAddress, PC;

function initCore() {
    "attiny4" === target ? (memory = Array(17408), flashStart = 16384, dataStart = 64, dataEnd = 96, ioRegStart = 0, portB = 2, pllCsr = portF = portE = portD = portC = 57005, bitsPerPort = 4) : "atmega8" === target ? (memory = Array(8192), flashStart = 1120, dataStart = 96, dataEnd = 1120, ioRegStart = 32, portB = 56, portC = 53, portD = 50, pllCsr = portF = portE = 57005, bitsPerPort = 8) : "atmega32u4" === target ? (memory = Array(32768), flashStart = 2816, dataStart = 256, dataEnd = 2816, ioRegStart = 32, portB = 37, portC = 40, portD = 43, portE = 46, portF = 49, pllCsr = 73, bitsPerPort = 8) : alert("Failed! Unknown target");
    PC = flashStart;
    SREG = ioRegStart + 63;
    vectorBase = flashStart + 172;
    usbVectorBase = vectorBase + 430;
    signatureOffset = flashStart + 178;
    jumpTableAddress = usbVectorBase + 64;
    mainAddress = usbVectorBase + 72
    for (a = 0; a < memory.length; a++) writeMemory(a, 0);
    memory[0x3FC0] = 0x0C;
    memory[0x3FC1] = 0x0F;
    memory[0x3FC2] = 0xFE;
    memory[0x3FC3] = 0xE0;
}

function writeClockRegister(b) {
    memory[pllCsr] = 0 < (b & 2) ? memory[pllCsr] | 1 : memory[pllCsr] & 254
}

function writeSpecificPort(b) {
    var a, d = 8 * b;
    switch (b) {
    case 0:
        a = dataQueueB;
        break;
    case 1:
        a = dataQueueC;
        break;
    case 2:
        a = dataQueueD;
        break;
    case 3:
        a = dataQueueE;
        break;
    case 4:
        a = dataQueueF
    }
    for (i = 0; i < bitsPerPort; i++) b = "pin" + parseInt(i + d), 0 < document.getElementById(b).getContext("2d").getImageData(0, 0, 10, 10).data[1] && setPin(b, "#FF0000");
    a = a.shift();
    for (i = 0; i < bitsPerPort; i++) parseInt(a) & 1 << i && setPin("pin" + parseInt(i + d), "#00FF00")
}

function writeMemory(b, a) {
    memory[b] = a;
    b == portB && dataQueueB.push(a);
    b == portC && dataQueueC.push(a);
    b == portD && dataQueueD.push(a);
    b == portE && dataQueueE.push(a);
    b == portF && dataQueueF.push(a);
    b == pllCsr && writeClockRegister(a)
}
function readMemory(b) {
    return b === SREG ? C | Z << 1 | N << 2 | V << 3 | S << 4 | H << 5 | T << 6 | I << 7 : memory[b]
}

function loadMemory(b) {
    initCore();
    b = b.split(/["\n"]/);
    for (var a = 0; b[a];) {
        var d = b[a].substring(1),
            f = parseInt(d.substring(2, 6), 16),
            c = 0;
        for (j = 4; j < parseInt(d.substring(0, 2), 16) + 4; j += 2) {
            var e = 2 * j,
                e = d.substring(e, e + 4);
            writeMemory(flashStart + f + c, e.substring(0, 2));
            writeMemory(flashStart + f + c + 1, e.substring(2));
            c += 2
        }
        a++
    }
}
function setPreEvaluationFlags(b, a) {
    H = 15 < b + a ? 1 : 0
}

function setPostEvaluationFlags(b) {
    255 < b ? (C = 1, b &= 255) : C = 0;
    Z = 0 === b ? 1 : 0;
    N = 128 === (128 & b) ? 1 : 0;
    V = 127 < b ? 1 : 0;
    S = N ^ V
}
function getBreakDistance(b, a) {
    return (b & 3) << 5 | (a & 240) >> 3 | (a & 8) >> 3
}
function getRegister(b, a) {
    return ioRegStart + ((a & 248) >> 3)
}
function getRegisterValue(b, a) {
    return a & 7
}
function getIOValue(b, a) {
    return ioRegStart + ((b & 6) >> 1 << 4 | a & 15)
}
function getJumpConstant(b, a) {
    return (b & 15) << 8 | a
}
function getBigConstant(b, a) {
    return (b & 15) << 4 | a & 15
}
function getSmallRegister(b, a) {
    return ((a & 240) >> 4) + 16
}

function getConstant(b, a) {
    return a & 192 | a & 15
}
function getUpperPair(b, a) {
    return 2 * ((a & 48) >> 4) + 24
}

function fetch(b, a) {
    var d = 16 * (b & 1) + ((a & 240) >> 4),
        f = 16 * ((b & 2) >> 1) + (a & 15);
    switch (b) {
    case 0:
        break;
    case 1:
        var c = 2 * ((a & 240) >> 4),
            e = 2 * (a & 15);
        r[c] = r[e];
        r[c + 1] = r[e + 1];
        break;
    case 4:
    case 5:
    case 6:
    case 7:
        H = 0;
        c = Z;
        e = r[d] - r[f] + C;
        setPostEvaluationFlags(e);
        Z = 0 === e ? c : 0;
        break;
    case 8:
    case 9:
    case 10:
    case 11:
        setPreEvaluationFlags(r[d], r[f]);
        r[d] = r[d] - r[f] - C;
        setPostEvaluationFlags(r[d]);
        break;
    case 12:
    case 13:
    case 14:
    case 15:
        setPreEvaluationFlags(r[d], r[f]);
        r[d] += r[f];
        setPostEvaluationFlags(r[d]);
        break;
    case 16:
    case 17:
    case 18:
    case 19:
        r[d] === r[f] && (PC += 2, c = parseInt(memory[PC - 2], 16), e = parseInt(memory[PC - 1], 16), 12 <= c && 148 == e | 149 == e && (PC += 2), 16 <= c | 0 == c && 144 == e | 145 == e && (PC += 2), 16 <= c | 0 == c && 146 == e | 147 == e && (PC += 2));
        break;
    case 20:
    case 21:
    case 22:
    case 23:
        setPreEvaluationFlags(r[d], r[f]);
        setPostEvaluationFlags(r[d] - r[f]);
        break;
    case 24:
    case 25:
    case 26:
    case 27:
        setPreEvaluationFlags(r[d], r[f]);
        r[d] -= r[f];
        setPostEvaluationFlags(r[d]);
        break;
    case 28:
    case 29:
    case 30:
    case 31:
        setPreEvaluationFlags(r[d], r[f]);
        r[d] = r[d] + r[f] + C;
        setPostEvaluationFlags(r[d]);
        break;
    case 32:
    case 33:
    case 34:
    case 35:
        H = 0;
        r[d] &= r[f];
        setPostEvaluationFlags(r[d]);
        C = 0;
        break;
    case 36:
    case 37:
    case 38:
    case 39:
        r[d] ^= r[f];
        break;
    case 40:
    case 41:
    case 42:
    case 43:
        r[d] |= r[f];
        break;
    case 44:
    case 45:
    case 46:
    case 47:
        r[d] = r[f];
        break;
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
        H = 0;
        setPostEvaluationFlags(r[getSmallRegister(b, a)] - getBigConstant(b, a));
        break;
    case 64:
    case 65:
    case 66:
    case 67:
    case 68:
    case 69:
    case 70:
    case 71:
    case 72:
    case 73:
    case 74:
    case 75:
    case 76:
    case 77:
    case 78:
    case 79:
        c = getBigConstant(b, a);
        e = getSmallRegister(b, a);
        for (0 < r[e] ^ 0 < c && (r[e] = r[e] - c - C); 0 > r[e];) r[e] = 256 + r[e];
        C = Math.abs(r[e]) < c + C;
        break;
    case 80:
    case 81:
    case 82:
    case 83:
    case 84:
    case 85:
    case 86:
    case 87:
    case 88:
    case 89:
    case 90:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
        e = getSmallRegister(b, a);
        r[e] -= getBigConstant(b, a);
        for (C = 0; 0 > r[e];) r[e] = 256 + r[e], C = 1;
        break;
    case 96:
    case 97:
    case 98:
    case 99:
    case 100:
    case 101:
    case 102:
    case 103:
    case 104:
    case 105:
    case 106:
    case 107:
    case 108:
    case 109:
    case 110:
    case 111:
        e = getSmallRegister(b, a);
        r[e] |= getBigConstant(b, a);
        break;
    case 112:
    case 113:
    case 114:
    case 115:
    case 116:
    case 117:
    case 118:
    case 119:
    case 120:
    case 121:
    case 122:
    case 123:
    case 124:
    case 125:
    case 126:
    case 127:
        H = 0;
        e = getSmallRegister(b, a);
        r[e] &= getBigConstant(b, a);
        setPostEvaluationFlags(r[e]);
        C = 0;
        break;
    case 128:
    case 129:
        0 === (a & 15) ? r[d] = readMemory(r[31] << 8 | r[30]) : 8 === (a & 15) ? r[d] = readMemory(r[29] << 8 | r[28]) : 0 === (a & 8 | 0) && (c = parseInt(r[d], 16), writeMemory(parseInt(r[28], 16), c), writeMemory(parseInt(r[29], 16), ++c));
        break;
    case 130:
    case 131:
        8 === (a & 15) && writeMemory(r[29] << 8 | r[28], r[d]);
        0 === (a & 15 | 0) && writeMemory(r[31] << 8 | r[30], r[d]);
        break;
    case 144:
    case 145:
        if (15 === (a & 15)) r[d] = memory[++SP];
        else if (4 === (a & 15) || 5 === (a & 15)) {
            var c = r[31] << 8 | r[30],
                g = 2 * (c >> 1) + flashStart,
                e = parseInt(memory[g], 16),
                g = parseInt(memory[g + 1], 16);
            r[d] = 0 === (c & 1) ? e : g;
            5 === (a & 15) && (r[30]++, 256 === r[30] && (r[30] = 0, r[31]++))
        } else 1 === (a & 15) ? (r[d] = readMemory(r[31] << 8 | r[30]), r[30] += 1, 256 == r[30] && (r[30] = 0, r[31] += 1)) : 2 === (a & 15) ? (r[30] -= 1, 0 > r[30] && (r[30] = 0, r[31] -= 1), r[d] = readMemory(r[31] << 8 | r[30])) : 13 === (a & 15) ? (r[d] = readMemory(r[27] << 8 | r[26]), r[26] += 1, 256 == r[26] && (r[26] = 0, r[27] += 1)) : 14 === (a & 15) ? (r[26] -= 1, 0 > r[26] && (r[26] = 0, r[27] -= 1), r[d] = readMemory(r[27] << 8 | r[26])) : r[d] = 12 === (a & 15) ? readMemory(r[27] << 8 | r[26]) : memory[parseInt(memory[PC++], 16) | parseInt(memory[PC++], 16) << 8];
        break;
    case 146:
    case 147:
        1 === (a & 15) && (writeMemory(r[31] << 8 | r[30], r[d]), r[30] += 1, 256 == r[30] && (r[30] = 0, r[31] += 1));
        2 === (a & 15) && (r[30] -= 1, 0 > r[30] && (r[30] = 255, r[31] -= 1), writeMemory(r[31] << 8 | r[30], r[d]));
        9 === (a & 15) && (writeMemory(r[29] << 8 | r[28], r[d]), r[28] += 1, 256 == r[28] && (r[28] = 0, r[29] += 1));
        10 === (a & 15) && (r[28] -= 1, 0 > r[28] && (r[28] = 255, r[29] -= 1), writeMemory(r[29] << 8 | r[28], r[d]));
        14 === (a & 15) && (r[26] -= 1, 0 > r[26] && (r[26] = 255, r[27] -= 1), writeMemory(r[27] << 8 | r[26], r[d]));
        15 === (a & 15) ? (writeMemory(SP, r[d]), SP--) : 0 === (a & 15) ? writeMemory(parseInt(memory[PC++], 16) | parseInt(memory[PC++], 16) << 8, r[d]) : 12 === (a & 15) ? (c = parseInt(r[26]), e = parseInt(r[27]) << 8, writeMemory(e | c, r[d])) : 13 === (a & 15) && (c = parseInt(r[26]), e = parseInt(r[27]) << 8, writeMemory(e | c, r[d]), r[26]++, 256 === r[26] && (r[26] = 0, r[27]++));
        break;
    case 148:
    case 149:
        0 === (a & 15) && (r[d] = 255 - r[d]);
        if (7 === (a & 15)) c = r[d] & 1, r[d] >>= 1, C && (r[d] |= 128), C = c;
        else if (2 === (a & 255)) r[d] = r[d] << 4 | r[d] >> 4;
        else if (3 === (a & 255)) r[d] += 1;
        else if (5 === (a & 255)) c = r[d], g = c & 1, c = c >> 1 | c & 128, setPostEvaluationFlags(c), r[d] = c, C = g, V = N ^ C;
        else if (6 === (a & 255)) C = r[d] & 1, r[d] >>= 1;
        else if (8 === (a & 255) && 148 === b) C = 1;
        else if (9 === (a & 255) && 148 === b) PC = 2 * (r[31] << 8 | r[30]) + flashStart;
        else if (24 === (a & 255) && 148 === b) Z = 1;
        else if (40 === (a & 255) && 148 === b) N = 1;
        else if (56 === (a & 255) && 148 === b) V = 1;
        else if (72 === (a & 255) && 148 === b) S = 1;
        else if (88 === (a & 255) && 148 === b) H = 1;
        else if (104 === (a & 255) && 148 === b) T = 1;
        else if (120 === (a & 255) && 148 === b) I = 1;
        else if (136 === (a & 255) && 148 === b) C = 0;
        else if (152 === (a & 255) && 148 === b) Z = 0;
        else if (168 === (a & 255) && 148 === b) N = 0;
        else if (184 === (a & 255) && 148 === b) V = 0;
        else if (200 === (a & 255) && 148 === b) S = 0;
        else if (216 === (a & 255) && 148 === b) H = 0;
        else if (232 === (a & 255) && 148 === b) T = 0;
        else if (248 === (a & 255) && 148 === b) I = 0;
        else if (8 === (a & 255) && 149 === b) e = memory[++SP], PC = e << 8 | memory[++SP];
        else if (136 === (a & 255) && 149 === b) break;
        else if (168 === (a & 255) && 149 === b) break;
        else if (9 === (a & 255)) writeMemory(SP--, PC & 255), writeMemory(SP--, PC >> 8), PC = 2 * (r[31] << 8 | r[30]) + flashStart;
        else if (10 === (a & 255)) r[d] -= 1;
        else if (12 === (a & 15) || 13 === (a & 15)) PC = flashStart + 2 * ((b & 1) << 20 | (a & 240) << 17 | (a & 1) << 16 | parseInt(memory[PC + 1], 16) << 8 | parseInt(memory[PC], 16));
        else if (14 === (a & 15) || 15 === (a & 15)) {
            if (hasDeviceSignature && PC === jumpTableAddress + calculatedOffset) {
                PC = mainAddress + calculatedOffset;
                break
            }
            writeMemory(SP--, PC + 2 & 255);
            writeMemory(SP--, PC + 2 >> 8);
            PC = flashStart + 2 * (parseInt(memory[PC + 1], 16) << 8 | parseInt(memory[PC], 16))
        }
        break;
    case 150:
        H = 0;
        c = getConstant(b, a);
        e = getUpperPair(b, a);
        r[e] = c & 15;
        r[e + 1] = (c & 240) >> 4;
        setPostEvaluationFlags(r[e + 1]);
        Z = 0 === r[e] && 0 === r[e + 1] ? 1 : 0;
        break;
    case 151:
        c = getConstant(b, a);
        e = getUpperPair(b, a);
        r[e] -= c & 15;
        r[e + 1] -= (c & 240) >> 4;
        break;
    case 152:
        c = getRegister(b, a);
        e = getRegisterValue(b, a);
        0 < (memory[c] & 1 << e) && writeMemory(c, memory[c] ^ 1 << e);
        break;
    case 153:
        0 == (memory[getRegister(b, a)] & 1 << getRegisterValue(b, a)) && (PC += 2), c = parseInt(memory[PC - 2], 16), e = parseInt(memory[PC - 1], 16), 12 <= c && 148 == e | 149 == e && (PC += 2), 16 <= c | 0 == c && 144 == e | 145 == e && (PC += 2), 16 <= c | 0 == c && 146 == e | 147 == e && (PC += 2);
    case 154:
        c = getRegister(b, a);
        writeMemory(c, memory[c] | 1 << getRegisterValue(b, a));
        break;
    case 155:
        0 < (memory[getRegister(b, a)] & 1 << getRegisterValue(b, a)) && (PC += 2);
        c = parseInt(memory[PC - 2], 16);
        e = parseInt(memory[PC - 1], 16);
        12 <= c && 148 == e | 149 == e && (PC += 2);
        16 <= c | 0 == c && 144 == e | 145 == e && (PC += 2);
        16 <= c | 0 == c && 146 == e | 147 == e && (PC += 2);
        break;
    case 176:
    case 177:
    case 178:
    case 179:
    case 180:
    case 181:
    case 182:
    case 183:
        r[d] = readMemory(getIOValue(b, a));
        break;
    case 184:
    case 185:
    case 186:
    case 187:
    case 188:
    case 189:
    case 190:
    case 191:
        writeMemory(getIOValue(b, a), r[d]);
        break;
    case 192:
    case 193:
    case 194:
    case 195:
    case 196:
    case 197:
    case 198:
    case 199:
    case 200:
    case 201:
    case 202:
    case 203:
    case 204:
    case 205:
    case 206:
    case 207:
        c = getJumpConstant(b, a);
        PC = 2048 === (c & 2048) ? PC - (4096 - 2 * (c ^ 2048)) : PC + 2 * c;
        break;
    case 208:
    case 209:
    case 210:
    case 211:
    case 212:
    case 213:
    case 214:
    case 215:
    case 216:
    case 217:
    case 218:
    case 219:
    case 220:
    case 221:
    case 222:
    case 223:
        writeMemory(SP--, PC & 255);
        writeMemory(SP--, PC >> 8);
        c = getJumpConstant(b, a);
        PC = 2048 === (c & 2048) ? PC - (4096 - 2 * (c ^ 2048)) : PC + 2 * c;
        break;
    case 224:
    case 225:
    case 226:
    case 227:
    case 228:
    case 229:
    case 230:
    case 231:
    case 232:
    case 233:
    case 234:
    case 235:
    case 236:
    case 237:
    case 238:
    case 239:
        r[getSmallRegister(b, a)] = getBigConstant(b, a);
        break;
    case 240:
    case 241:
    case 242:
    case 243:
        c = !1;
        switch (a & 7) {
        case 0:
            c = C;
            break;
        case 1:
            c = Z;
            break;
        case 3:
            c = V;
            break;
        case 5:
            c = H;
            break;
        case 6:
            c = T
        }
        c && (c = getBreakDistance(b, a), PC = 64 < c ? PC - 2 * (128 - c) : PC + 2 * c);
        break;
    case 244:
    case 245:
    case 246:
    case 247:
        c = !1;
        switch (a & 7) {
        case 0:
            c = !C;
            break;
        case 1:
            c = !Z;
            break;
        case 3:
            c = !V;
            break;
        case 5:
            c = !H;
            break;
        case 6:
            c = !T
        }
        c && (c = getBreakDistance(b, a), PC = 64 < c ? PC - 2 * (128 - c) : PC + 2 * c);
        break;
    case 248:
    case 249:
        r[d] |= T << (a & 7);
        break;
    case 250:
    case 251:
        T = 0 < (r[d] & 1 << getRegisterValue(b, a));
        break;
    case 252:
    case 253:
        0 === (r[d] & 1 << (a & 7)) && (PC += 2);
        c = parseInt(memory[PC - 2], 16);
        e = parseInt(memory[PC - 1], 16);
        12 <= c && 148 == e | 149 == e && (PC += 2);
        16 <= c | 0 == c && 144 == e | 145 == e && (PC += 2);
        16 <= c | 0 == c && 146 == e | 147 == e && (PC += 2);
        break;
    case 254:
    case 255:
        r[d] & 0 < 1 << (a & 7) && (PC += 2);
        c = parseInt(memory[PC - 2], 16);
        e = parseInt(memory[PC - 1], 16);
        12 <= c && 148 == e | 149 == e && (PC += 2);
        16 <= c | 0 == c && 144 == e | 145 == e && (PC += 2);
        16 <= c | 0 == c && 146 == e | 147 == e && (PC += 2);
        break;
    default:
        document.write("unknown 0x" + (PC - 2).toString(16).toUpperCase() + " " + b + " " + a + "<br/>")
    }
    r[d] &= 255;
    r[f] &= 255
}
function handleBreakpoint(b) {
    alert("Breakpoint at 0x" + b)
}
function isSoftBreakpoint(b) {
    for (i = 0; i < softBreakpoints.length; i++) if (softBreakpoints[i] + flashStart === b) return !0;
    return !1
}

function loop() {
    var b = parseInt(memory[PC], 16),
        a = parseInt(memory[++PC], 16);
    PC++;
    var d = 149 == a && 152 == b || isSoftBreakpoint(PC) || forceBreak;
    d || 207 == a && 255 == b ? d && (forceBreak = !1, isPaused = !0, handleBreakpoint((PC - 2).toString(16).toUpperCase())) : setTimeout(loop, 0);
    for (fetch(a, b); 0 < dataQueueB.length;) writeSpecificPort(0);
    for (; 0 < dataQueueC.length;) writeSpecificPort(1);
    for (; 0 < dataQueueD.length;) writeSpecificPort(2);
    for (; 0 < dataQueueE.length;) writeSpecificPort(3);
    for (; 0 < dataQueueF.length;) writeSpecificPort(4)
}

function engineInit() {
    for (i = 0; i < r.length; i++) r[i] = 0;
    var b = 0;
    12 === parseInt(memory[flashStart], 16) && (b = flashStart + 2 * (parseInt(memory[flashStart + 3], 16) << 8 | parseInt(memory[flashStart + 2], 16)));
    b > usbVectorBase && (calculatedOffset = b - usbVectorBase);
    b = [];
    for (i = signatureOffset + calculatedOffset; i < signatureOffset + calculatedOffset + 32; i += 2) b.push(String.fromCharCode(parseInt(memory[i], 16)));
    switch (b.toString().replace(/,/g, "")) {
    case "Arduino Micro   ":
        hasDeviceSignature = !0
    }
}

function exec() {
    isPaused && (isPaused = !1, loop())
}

function isNumber(b) {
    return !isNaN(parseInt(b, 16))
}

function setPin(b, a) {
    var d = document.getElementById(b).getContext("2d");
    d.fillStyle = a;
    d.fillRect(0, 0, 10, 10)
}

function generateRegisterHtml(b) {
    return '<textarea id="register' + b + '" rows="1" cols="4">0x00</textarea>'
}

function generateFillerHtml() {
    return '<div style=\"display: table-cell;\"><canvas width=\"10\" height=\"10\"/></div>';
}

function generatePortHtml(b, a) {
    var d = 8 * b,
        f = '<div style="display: table-row">';
    for (i = 0; 8 > i; i++) {
        var c = parseInt(d + i),
            f = f + ('<div style="display: table-cell;">  <canvas id="pin' + c + '" width="10" height="10"/> </div>');
        0 < (1 << i & a) && (f += '<script>setPin("pin' + c + '", "#FF0000");\x3c/script>')
    }
    return f + "</div>"
};
