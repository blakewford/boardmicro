/* ARM simulation code for pichai.

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

PC = 0x0;
memory = Array(262144);

function loadMemory(c, b) {
  c = b ? c.split(/["|"]/) : c.split(/["\n"]/);
  for (var d = 0;c[d];) {
    var h = c[d].substring(1), e = parseInt(h.substring(2, 6), 16), f = 0;
    var type = h.substring(6, 8);
    var shift = 4;
    for (j = 4;j < parseInt(h.substring(0, 2), 16) + 4;j += 2) {
      var g = 2 * j, g = h.substring(g, g + 4);
      if(type == 0){
        //Write Memory
        memory[e+f] = g.substring(0, 2);
        memory[e+f+1] = g.substring(2);
        console.log((e+f).toString(16)+": "+memory[e+f]+memory[e+f+1]);
      }
      //Handle new segment types; Start Segment Address
      if(type == 3){
        PC = parseInt(g.substring(0, 2)+g.substring(2)) << shift;
        shift -= 4;
      }
      f += 2;
    }
    d++;
  }
  console.log(PC);
}

//0 0 0 Op Offset5 Rs Rd Move shifted register
//0 0 0 1 1 I Op Rn/offset3 Rs Rd Add/subtract
//0 0 1 Op Rd Offset8 Move/compare/add/subtract immediate
//0 1 0 0 0 0 Op Rs Rd ALU operations
//0 1 0 0 0 1 Op H1 H2 Rs/Hs Rd/Hd Hi register operations/branch exchange
//0 1 0 0 1 Rd Word8 PC-relative load
//0 1 0 1 L B 0 Ro Rb Rd Load/store with register offset
//0 1 0 1 H S 1 Ro Rb Rd Load/store sign-extended byte/halfword
//0 1 1 B L Offset5 Rb Rd Load/store with immediate offset
//1 0 0 0 L Offset5 Rb Rd Load/store halfword
//1 0 0 1 L Rd Word8 SP-relative load/store
//1 0 1 0 SP Rd Word8 Load address
//1 1 0 0 L Rb Rlist Multiple load/store
//1 1 0 1 Cond Soffset8 Conditional branch
//1 1 0 1 1 1 1 1 Value8 Software Interrupt
//1 1 1 0 0 Offset11 Unconditional branch
//1 1 1 1 H Offset Long branch with link

function offsetStack(byte){
  //S SWord7 Add offset to stack pointer
}
function pushpop(){
  //Rlist
  switch(options){
    case 4:
      break;
    case 5:
      break;
    case 12:
      break;
    case 13:
      break;
  }
}

function fetch(c, data) {
  if(c < 128){
    switch(c) {
    }
  }
  else if(c >= 128 && c < 256){
    switch(c){
      case 176:
        offsetStack(data);
        break;
      case 180:
      case 181:
      case 188:
      case 189:
        pushpop(op & 0xF, data);
        break;
    }
  }
  else{
      console.log("Unknown");
  }
}
function loop() {
    fetch(0);
    setTimeout(loop, 1000);
}
function engineInit() {

}
function exec() {
    loop();
}

loadMemory(":1080000080B500AFC046BD4680BC01BC0047C0463D\n:040000030000800178\n:00000001FF");
engineInit()
exec();
