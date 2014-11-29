function readelfHeader(elf)
{
  var arch = elf.charCodeAt(18) | (elf.charCodeAt(19) << 8);
  if(arch != 0x53) // AVR 8-bit
    throw "Architecture mismatch";
  throw "Elf support incomplete";
}
function readelfSection(elf)
{
}
