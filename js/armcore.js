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

function loadMemory(c, b) {
  c = b ? c.split(/["|"]/) : c.split(/["\n"]/);
  for (var d = 0;c[d];) {
    var h = c[d].substring(1), e = parseInt(h.substring(2, 6), 16), f = 0;
    for (j = 4;j < parseInt(h.substring(0, 2), 16) + 4;j += 2) {
      var g = 2 * j, g = h.substring(g, g + 4);
      //Write Memory
      memory[e+f] = g.substring(0, 2);
      memory[e+f+1] = g.substring(2);
      //Handle new segment types; Start Segment Address
      console.log((e+f).toString(16)+": "+memory[e+f]+memory[e+f+1]);
      f += 2;
    }
    d++;
  }
}
function fetch(c) {
  if(c < 128){
    switch(c) {
    }
  }
  else if(c >= 128 && c < 256){
    switch(c){
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
