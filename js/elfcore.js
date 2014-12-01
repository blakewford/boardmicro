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
  header.stringSectionIndex  = elf.charCodeAt(50) | (elf.charCodeAt(51) << 8);
}
var section = {};
function readelfSection(name)
{
  var start = 0;
  var index = 0;
  var strIndex = 0;
  var numberSections = header.sectionHeaderNum;
  var shstrOffset = header.sectionHeaderOffset + (header.sectionHeaderSize*header.stringSectionIndex);
  shstrOffset     = ((elf.charCodeAt(shstrOffset + 18) | elf.charCodeAt(shstrOffset + 19) << 8) << 16) | elf.charCodeAt(shstrOffset + 16) | (elf.charCodeAt(shstrOffset + 17) << 8);
  while(numberSections--)
  {
    section.name = "";
    start = header.sectionHeaderOffset + (header.sectionHeaderSize*index);
    strIndex = ((elf.charCodeAt(start + 2) | elf.charCodeAt(start + 3) << 8) << 16) | elf.charCodeAt(start) | (elf.charCodeAt(start + 1) << 8);
    var str = shstrOffset + strIndex;
    while(elf[str] != '\0')
      section.name = section.name.concat(elf[str++]);
    if(section.name == name)
      break;
    index++;
  }
  section.address = ((elf.charCodeAt(start + 14) | elf.charCodeAt(start + 15) << 8) << 16) | elf.charCodeAt(start + 12) | (elf.charCodeAt(start + 13) << 8);
  section.fileOffset  = ((elf.charCodeAt(start + 18) | elf.charCodeAt(start + 19) << 8) << 16) | elf.charCodeAt(start + 16) | (elf.charCodeAt(start + 17) << 8);
  section.Size = ((elf.charCodeAt(start + 22) | elf.charCodeAt(start + 23) << 8) << 16) | elf.charCodeAt(start + 20) | (elf.charCodeAt(start + 21) << 8);
}
function getHexFromSection()
{
  var hex = "";
  var line = "";
  var written = 0;
  var toWrite = section.Size;
  while(toWrite > 0)
  {
    var bytes = toWrite >= 16 ? 16: toWrite;
    line = ":"+ ("0" + bytes.toString(16)).substr(-2).toUpperCase();
    line += ("000" + (section.address + written).toString(16)).substr(-4).toUpperCase();
    line += "00";
    var value = 0;
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
  return hex;
}
function getHexFromElf(bytes)
{
  readelfHeader(bytes);
  readelfSection(".text");
  var hex = getHexFromSection();
  var textSize = section.Size;
  readelfSection(".data");
  section.address = textSize;
  hex += getHexFromSection();
  hex += ":00000001FF";
  return hex;
}
