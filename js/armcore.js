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

memory = Array(262144);
r = Array(16);
PSR = 0x01000000;
CONTROL= 0x00000000;

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
        memory[e+f] = parseInt(g.substring(0, 2), 16);
        memory[e+f+1] = parseInt(g.substring(2), 16);
        console.log((e+f).toString(16)+": "+memory[e+f].toString(16)+memory[e+f+1].toString(16));
      }
      //Handle new segment types; Start Segment Address
      if(type == 3){
        r[15] = parseInt(g.substring(0, 2)+g.substring(2), 16) << shift;
        shift -= 4;
      }
      f += 2;
    }
    d++;
  }
  console.log(r[15].toString(16));
}

//0 0 0 Op Offset5 Rs Rd Move shifted register
//0 0 1 Op Rd Offset8 Move/compare/add/subtract immediate
//0 1 0 0 0 0 Op Rs Rd ALU operations
//0 1 0 0 0 1 Op H1 H2 Rs/Hs Rd/Hd Hi register operations/branch exchange
//0 1 0 0 1 Rd Word8 PC-relative load
//0 1 0 1 L B 0 Ro Rb Rd Load/store with register offset
//0 1 0 1 H S 1 Ro Rb Rd Load/store sign-extended byte/halfword
//0 1 1 B L Offset5 Rb Rd Load/store with immediate offset
//1 0 0 0 L Offset5 Rb Rd Load/store halfword
//1 0 0 1 L Rd Word8 SP-relative load/store
//1 1 0 0 L Rb Rlist Multiple load/store
//1 1 0 1 Cond Soffset8 Conditional branch
//1 1 0 1 1 1 1 1 Value8 Software Interrupt
//1 1 1 0 0 Offset11 Unconditional branch
//1 1 1 1 H Offset Long branch with link

function loadAddress(nibble, data){
  var SP = (nibble & 8) >> 3;
  var rd = (nibble & 7);
  console.log("r"+rd+" SP:"+SP+" "+data);
}
function addSubtract(options, data){
  if(!options & 8)
    return; //Move
  var I = options & 4;
  var subtract = options & 2;
  var index = ((data & 0xF) >> 2) + ((options & 1) << 2);
  var value = I ? index: r[index];
  console.log(index);
}
function offsetStack(byte){
  var subtract = byte >> 7;
  var value = (byte & 127)*4;
  value = subtract ? -value: value;
  console.log(value +" from SP");
}
function pushpop(options, rlist){
  var pop = false;
  var lrpc = false;
  switch(options){
    case 5:
      lrpc = true;
      break;
    case 12:
      pop = true;
      break;
    case 13:
      pop = lrpc = true;
      break;
  }
  for(var i = 0; i < 8; i++){
    var inlist = rlist & 1 << i;
    if(pop && inlist){
      var str = "Pop r"+i.toString();
      if(lrpc)
        str += " PC"
      console.log(str);
    }else if(inlist){
      var str = "Push r"+i.toString();
      if(lrpc)
        str += " LR"
      console.log(str);
    }
  }
}

function fetch(c, data) {
  if(c < 128){
    switch(c) {
      case 1:
        addSubtract(c & 0xF, data);
        break;
    }
  }
  else if(c >= 128 && c < 256){
    switch(c){
      case 160:
      case 161:
      case 162:
      case 163:
      case 164:
      case 165:
      case 166:
      case 167:
      case 168:
      case 169:
      case 170:
      case 171:
      case 172:
      case 173:
      case 174:
      case 175:
        loadAddress(c & 0xF, data);
        break;
      case 176:
        offsetStack(data);
        break;
      case 180:
      case 181:
      case 188:
      case 189:
        pushpop(c & 0xF, data);
        break;
    }
  }
  else{
      console.log("Unknown" + c);
  }
}
var i = 1;
function loop() {
  while(r[15] < 0x8004){
    fetch(memory[r[15]], memory[r[15]-1]);
    setTimeout(loop, 1000);
    r[15] += i*2;
    i++;
  }
}
function engineInit() {
  PSR = 0x01000000;
  CONTROL= 0x00000000;
  r[13] = memory[0];
  r[14] = 0xFFFFFFFF;
}
function exec() {
    loop();
}

loadMemory(":1080000080B500AFC046BD4680BC01BC0047C0463D\n:040000030000800178\n:00000001FF");
engineInit()
exec();
