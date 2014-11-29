var header = {};
function readelfHeader(elf)
{
  var arch = elf.charCodeAt(18) | (elf.charCodeAt(19) << 8);
  if(arch != 0x53) // AVR 8-bit
    throw "Architecture mismatch";
  header.sectionHeaderOffset = elf.charCodeAt(32) | (elf.charCodeAt(33) << 8);
  header.sectionHeaderSize   = elf.charCodeAt(46) | (elf.charCodeAt(47) << 8);
  header.sectionHeaderNum    = elf.charCodeAt(48) | (elf.charCodeAt(49) << 8);
}
function readelfSection(elf, name)
{
  if(name != ".text")
    throw "Section name not supported";
  var start = header.sectionHeaderOffset + (header.sectionHeaderSize*2);
  var fileOffset = ((elf.charCodeAt(start + 18) | elf.charCodeAt(start + 19) << 8) << 16) | elf.charCodeAt(start + 16) | (elf.charCodeAt(start + 17) << 8);
  var sectionSize = ((elf.charCodeAt(start + 22) | elf.charCodeAt(start + 23) << 8) << 16) | elf.charCodeAt(start + 20) | (elf.charCodeAt(start + 21) << 8);
  throw "Elf implementation incomplete";
}
