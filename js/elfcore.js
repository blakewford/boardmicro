var elf;
var header = {};
function readelfHeader(bytes)
{
  elf = bytes;
  var arch = elf.charCodeAt(18) | (elf.charCodeAt(19) << 8);
  if(arch != 0x53) // AVR 8-bit
    throw "Architecture mismatch";
  header.sectionHeaderOffset = elf.charCodeAt(32) | (elf.charCodeAt(33) << 8);
  header.sectionHeaderSize   = elf.charCodeAt(46) | (elf.charCodeAt(47) << 8);
  header.sectionHeaderNum    = elf.charCodeAt(48) | (elf.charCodeAt(49) << 8);
}
var section = {};
function readelfSection(name)
{
  if(name != ".text")
    throw "Section name not supported";
  var start = header.sectionHeaderOffset + (header.sectionHeaderSize*2);
  section.name = ".text";
  section.fileOffset  = ((elf.charCodeAt(start + 18) | elf.charCodeAt(start + 19) << 8) << 16) | elf.charCodeAt(start + 16) | (elf.charCodeAt(start + 17) << 8);
  section.Size = ((elf.charCodeAt(start + 22) | elf.charCodeAt(start + 23) << 8) << 16) | elf.charCodeAt(start + 20) | (elf.charCodeAt(start + 21) << 8);
}
function getHexFromElf()
{
  if(section.name != ".text")
    throw "Section name not supported";
  var hex = "";
  var line = "";
  var written = 0;
  var toWrite = section.Size;
  while(toWrite > 0)
  {
    line = ":10";
    line += ("000" + written.toString(16)).substr(-4);
    line += "00";
    var value = 0;
    var bytes = toWrite >= 16 ? 16: toWrite;
    for(var i=0; i < bytes; i++)
    {
      value = elf.charCodeAt(section.fileOffset + written);
      line += ("0" + value.toString(16)).substr(-2).toUpperCase();
      written++;
    }
    toWrite -= bytes;
    var sum = 0;
    for(var j =1; j < (bytes*2)+8; j+=2)
      sum += parseInt(line.substr(j,2), 16);
    sum = ~sum;
    sum++;
    sum = sum & 0xFF;
    line += ("0" + sum.toString(16)).substr(-2).toUpperCase();
    line += "\n";
    hex += line;
  }
  hex += ":00000001FF";
  return hex;
}
