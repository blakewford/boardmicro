var elf, header = {};
function readelfHeader(b) {
  elf = b;
  if (83 != (elf.charCodeAt(18) | elf.charCodeAt(19) << 8)) {
    throw "Architecture mismatch";
  }
  header.sectionHeaderOffset = (elf.charCodeAt(34) | elf.charCodeAt(35) << 8) << 16 | elf.charCodeAt(32) | elf.charCodeAt(33) << 8;
  header.sectionHeaderSize = elf.charCodeAt(46) | elf.charCodeAt(47) << 8;
  header.sectionHeaderNum = elf.charCodeAt(48) | elf.charCodeAt(49) << 8;
  header.stringSectionIndex = elf.charCodeAt(50) | elf.charCodeAt(51) << 8;
}
var section = {};
function readelfSection(b) {
  for (var a = 0, e = 0, d = 0, g = header.sectionHeaderNum, f = header.sectionHeaderOffset + header.sectionHeaderSize * header.stringSectionIndex, f = (elf.charCodeAt(f + 18) | elf.charCodeAt(f + 19) << 8) << 16 | elf.charCodeAt(f + 16) | elf.charCodeAt(f + 17) << 8;g--;) {
    section.name = "";
    a = header.sectionHeaderOffset + header.sectionHeaderSize * e;
    d = (elf.charCodeAt(a + 2) | elf.charCodeAt(a + 3) << 8) << 16 | elf.charCodeAt(a) | elf.charCodeAt(a + 1) << 8;
    for (d = f + d;"\x00" != elf[d];) {
      section.name = section.name.concat(elf[d++]);
    }
    if (section.name == b) {
      break;
    }
    e++;
  }
  section.address = (elf.charCodeAt(a + 14) | elf.charCodeAt(a + 15) << 8) << 16 | elf.charCodeAt(a + 12) | elf.charCodeAt(a + 13) << 8;
  section.fileOffset = (elf.charCodeAt(a + 18) | elf.charCodeAt(a + 19) << 8) << 16 | elf.charCodeAt(a + 16) | elf.charCodeAt(a + 17) << 8;
  section.Size = (elf.charCodeAt(a + 22) | elf.charCodeAt(a + 23) << 8) << 16 | elf.charCodeAt(a + 20) | elf.charCodeAt(a + 21) << 8;
}
function getHexFromSection() {
  for (var b = "", a = "", e = 0, d = section.Size;0 < d;) {
    for (var g = 16 <= d ? 16 : d, a = ":" + ("0" + g.toString(16)).substr(-2).toUpperCase(), a = a + ("000" + (section.address + e).toString(16)).substr(-4).toUpperCase(), a = a + "00", f = 0, l = 0;l < g;l++) {
      f = elf.charCodeAt(section.fileOffset + e), a += ("0" + f.toString(16)).substr(-2).toUpperCase(), e++;
    }
    d -= g;
    f = 0;
    for (l = 1;l < 2 * g + 8;l += 2) {
      f += parseInt(a.substr(l, 2), 16);
    }
    f = ~f;
    f++;
    f &= 255;
    a += ("0" + f.toString(16)).substr(-2).toUpperCase();
    a += "\n";
    b += a;
  }
  return b;
}
function getHexFromElf(b) {
  readelfHeader(b);
  readelfSection(".text");
  b = getHexFromSection();
  var a = section.Size;
  readelfSection(".data");
  section.address = a;
  b += getHexFromSection();
  return b + ":00000001FF";
}
function getCIE(b) {
  var a = elf.charCodeAt(b);
  elf.charCodeAt(b + 1);
  var e = decodeULEB(elf, b + 2), offset = b + 2 + getBytesForLEB(elf, b + 2), d = decodeSLEB(elf, offset), g = elf.charCodeAt(offset + getBytesForLEB(elf, offset));
  if (1 != a || 2 != e || 127 != d || 36 != g) {
    throw "CIE not supported";
  }
  if (12 != elf.charCodeAt(b + 5) || 32 != elf.charCodeAt(b + 6) || 2 != elf.charCodeAt(b + 7) || 164 != elf.charCodeAt(b + 8) || 1 != elf.charCodeAt(b + 9) || 0 != elf.charCodeAt(b + 10) || 0 != elf.charCodeAt(b + 11)) {
    throw "CIE not formatted as expected";
  }
}
var frames = [];
function getFDE(b, a, e) {
  var fde = {};
  fde.start = (elf.charCodeAt(b + 2) | elf.charCodeAt(b + 3) << 8) << 16 | elf.charCodeAt(b) | elf.charCodeAt(b + 1) << 8;
  fde.range = (elf.charCodeAt(b + 6) | elf.charCodeAt(b + 7) << 8) << 16 | elf.charCodeAt(b + 4) | elf.charCodeAt(b + 5) << 8;
  fde.instructions = [];
  var list = b+8;
  while(list < b+e-4)
    fde.instructions.push(elf.charCodeAt(list++));
  frames.push(fde);
}
function getBytesForLEB(b, a) {
  for (var e = 0;;) {
    var d = b.charCodeAt(a++);
    e++;
    if (0 == (d & 128)) {
      break;
    }
  }
  return e;
}
function decodeULEB(b, a) {
  for (var e = 0, d = 0;;) {
    var g = b.charCodeAt(a++), e = e | (g & 127) << d;
    if (0 == (g & 128)) {
      break;
    }
    d += 7;
  }
  return e;
}
function decodeSLEB(b, a) {
  for (var e = 0, d = 0;;) {
    var g = b.charCodeAt(a++), e = e | (g & 127) << d, d = d + 7;
    if (0 == (g & 128)) {
      break;
    }
  }
  16 > d && 0 < (g & 32768) && (e |= -(1 << d));
  return e;
}
var sourceLines = {};
function buildLineInfo() {
  readelfSection(".debug_line");
  for (var b = section.fileOffset, a = b;a < b + section.Size;) {
    var e = (elf.charCodeAt(a + 2) | elf.charCodeAt(a + 3) << 8) << 16 | elf.charCodeAt(a) | elf.charCodeAt(a + 1) << 8;
    if (2 != (elf.charCodeAt(a + 4) | elf.charCodeAt(a + 5) << 8)) {
      throw "Unable to parse line info";
    }
    elf.charCodeAt(a + 8);
    elf.charCodeAt(a + 9);
    elf.charCodeAt(a + 6);
    elf.charCodeAt(a + 7);
    var d = elf.charCodeAt(a + 10);
    if (2 != d) {
      throw "Unexpected value";
    }
    elf.charCodeAt(a + 11);
    for (var g = elf.charCodeAt(a + 12), g = 127 < g ? -(256 - g) : g, f = elf.charCodeAt(a + 13), l = elf.charCodeAt(a + 14), k = 15;k < 15 + l - 1;k++) {
      if (1 < elf.charCodeAt(a + k)) {
        throw "Unexpected opcode length";
      }
    }
    for (var c = !0, k = a + 15 + l;c;) {
      for (;"\x00" != elf[k++];) {
      }
      c = "\x00" != elf[k];
    }
    for (var c = !0, h = ++k, m = 0, k = {};c;) {
      m++;
      for (k[m] = "";"\x00" != elf[h++];) {
        k[m] = k[m].concat(elf[h - 1]);
      }
      h += 3;
      c = "\x00" != elf[h];
    }
    for (var c = ++h, h = 0, n = m = 1;c < a + e + 4;) {
      switch(elf.charCodeAt(c)) {
        case 0:
          c++;
          switch(elf.charCodeAt(c + 1)) {
            case 1:
              sourceLines[h] = k[m] + " line " + n.toString();
              h = 0, n = m = 1;
              break;
            case 2:
              h = (elf.charCodeAt(c + 4) | elf.charCodeAt(c + 5) << 8) << 16 | elf.charCodeAt(c + 2) | elf.charCodeAt(c + 3) << 8;
          }
          c += elf.charCodeAt(c);
          c++;
          break;
        case 1:
          sourceLines[h] = k[m] + " line " + n.toString();
          c++;
          break;
        case 2:
          h += decodeULEB(elf, c + 1) * d;
          c += getBytesForLEB(elf, c + 1) + 1;
          break;
        case 3:
          n += decodeSLEB(elf, c + 1);
          c += getBytesForLEB(elf, c + 1) + 1;
          break;
        case 4:
          m = decodeULEB(elf, c + 1);
          c += getBytesForLEB(elf, c + 1) + 1;
          break;
        case 5:
          decodeULEB(elf, c + 1);
          c += getBytesForLEB(elf, c + 1) + 1;
          break;
        case 6:
          c++;
          break;
        case 7:
          c++;
          break;
        case 8:
          h += Math.floor((255 - l) / f) * d;
          c++;
          break;
        case 9:
          throw "Unimplemented opcode";;
        default:
          h += Math.floor((elf.charCodeAt(c) - l) / f) * d, n += g + (elf.charCodeAt(c) - l) % f, sourceLines[h] = k[m] + " line " + n.toString(), c++;
      }
    }
    a = c;
  }
}
function buildFrameInfo() {
  readelfSection(".debug_frame");
  for (var b = section.fileOffset, a = b;a < b + section.Size;) {
    var e = (elf.charCodeAt(a + 2) | elf.charCodeAt(a + 3) << 8) << 16 | elf.charCodeAt(a) | elf.charCodeAt(a + 1) << 8, d = (elf.charCodeAt(a + 7) | elf.charCodeAt(a + 6) << 8) << 16 | elf.charCodeAt(a + 4) | elf.charCodeAt(a + 5) << 8;
    -1 == d ? getCIE(a + 8) : getFDE(a + 8, d, e);
    a += e;
    a += 4;
  }
}
;
