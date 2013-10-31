    /* AVR simulation code for webduino.
    
    This file is part of webduino.
    
    webduino is free software; you can redistribute it and/or modify it under
    the terms of the GNU General Public License as published by the Free
    Software Foundation; either version 3, or (at your option) any later
    version.
    
    webduino is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABILITY or
    FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
    for more details.
    
    You should have received a copy of the GNU General Public License
    along with webduino; see the file LICENSE.  If not see
    <http://www.gnu.org/licenses/>.  */
      function isNumber(n) {
          return !isNaN(parseInt(n, 16));
      }
    
      function fillLED(led ,color){
          var c=document.getElementById(led);
          var ctx=c.getContext("2d");
          ctx.fillStyle=color;
          ctx.fillRect(0,0,10,10);    
      }
    
      var PC = 0;
      var SP = 0x5F;
      var r = new Array(32);
      var SREG, C, Z, N, V, S, H, T, I;
    
      /*
      //ATTiny4
      var memory = new Array(0x4400);
      var flashStart = 0x4000;
      var dataStart = 0x40;
      var dataEnd = 0x60;
      var ioregStart = 0x0;
      var portBloc = 0x2;
      var bitsPerPort = 0x4;
      */
    
      //ATMega8
      var memory = new Array(0x2000);
      var flashStart = 0x460;
      var dataStart = 0x60;
      var dataEnd = 0x460; 
      var ioRegStart = 0x20;
      var portBloc = 0x38;
      var bitsPerPort = 0x8;
    
      var dataQueue = [];
    
      function writeDataToPort(){
          if(dataQueue.length > 0){
              for(i = 0; i < bitsPerPort; i++)
                  fillLED("led"+i, "#FF0000");
              var data = dataQueue.shift();
              for(i = 0; i < bitsPerPort; i++){
                  if(data & (0x1 << i))
                      fillLED("led"+i, "#00FF00");
              }
          }
      }
    
      function writeMemory(address, data){
          memory[address] = data;
          if(address == portBloc)
              dataQueue.push(data);
      }
    
      function loadMemory(result){
          for(i = 0; i < memory.length; i++)
              writeMemory(i, 0);
          var hexdump = result.split(/["\n"]/);
          var i = 0;
          while(hexdump[i]){
              var line = hexdump[i].substring(1);
              var offset = parseInt(line.substring(2,6), 16);
              var k = 0;
              for(j = 4; j < parseInt(line.substring(0,2), 16)+4; j+=2){
                  var ndx = 2*j;
                  var word = line.substring(ndx, ndx+4);
                  if(offset+k >= dataStart && offset+k < dataEnd){
                      writeMemory(offset+k, word.substring(0,2));
                      writeMemory(offset+k+1, word.substring(2));
                  }else{
                      writeMemory(offset+k, word.substring(2));
                      writeMemory(offset+k+1, word.substring(0,2));                
                  }
                  k+=2;
              }
              i++;
          }
      }
    
      function setPreEvaluationFlags(dest, src){
          var halfrd = dest & 0xF;
          var halfrr = src & 0xF;
          if((dest+src) > 0xF){  
              H = 1;
          }else{
              H = 0;
          }
      }
    
      function setPostEvaluationFlags(result){
          if(result > 0xFF){  
              C = 1;
              result &= 0xFF;
          }else{
              C = 0;
          }
          if(result === 0x0){
              Z = 1;
          }else{
              Z = 0;
          }
          if((0x80 & result) === 0x80){
              N = 1;  
          }else{
              N = 0;
          }
          if(result > 0x7F){
              V = 1;
          }else{
              V = 0;
          }
        
          S = N ^ V;
      }
    
      function fetch(opcode, params){
          var dst = ((opcode & 0x1)*16)+((params & 0xF0) >> 0x4);
          var src = (((opcode & 0x2) >> 1)*16)+(params & 0xF);
          var upperPair = (((params & 0x30) >> 0x4)*2)+24;
          var constant = (params & 0xC0) | (params & 0xF);
          var smallReg = ((params & 0xF0) >> 0x4)+16;
          var bigConstant = ((opcode & 0xF) << 0x4) | (params & 0xF);
          var jumpConstant = ((opcode & 0xF) << 0x8) | params;
          var io = ((((opcode & 0x6) >> 0x1) << 0x4) | (params & 0xF));
          var regSet = (params & 0xF8) >> 0x3;
          var regVal = (params & 0x07);
          var breakDistance = ((opcode & 0x3) << 0x5) | ((params & 0xF0) >> 0x3) | ((params & 0x8) >> 0x3);
          switch(opcode){
              case 0x01:
                  var halfDest = ((params & 0xF0) >> 0x4)*2;
                  var halfSrc = (params & 0xF)*2;
                  r[halfDest] = r[halfSrc];
                  r[halfDest+1] = r[halfSrc+1];
                  break;
              case 0x04:
              case 0x05:
              case 0x06:
              case 0x07:
                  H = 0;
                  setPostEvaluationFlags(r[dst] - r[src] + C);
                  break;
              case 0x08:
              case 0x09:
              case 0x0A:
              case 0x0B:
                  setPreEvaluationFlags(r[dst], r[src]);
                  r[dst] = r[dst]-r[src]-C;
                  setPostEvaluationFlags(r[dst]);
                  break;
              case 0x0C:
              case 0x0D:
              case 0x0E:
              case 0x0F:
                  setPreEvaluationFlags(r[dst], r[src]);
                  r[dst] = r[dst]+r[src];
                  setPostEvaluationFlags(r[dst]);
                  break;
              case 0x18:
              case 0x19:
              case 0x1A:
              case 0x1B:
                  setPreEvaluationFlags(r[dst], r[src]);
                  r[dst] = r[dst]-r[src];
                  setPostEvaluationFlags(r[dst]);
                  break;
              case 0x1C:
              case 0x1D:
              case 0x1E:
              case 0x1F:
                  setPreEvaluationFlags(r[dst], r[src]);
                  r[dst] = r[dst]+r[src]+C;
                  setPostEvaluationFlags(r[dst]);
                  break;
              case 0x20:
              case 0x21:
              case 0x22:
              case 0x23:
                  H = 0;
                  r[dst] = r[dst] & r[src];
                  setPostEvaluationFlags(r[dst]);
                  C = 0;
                  break;
              case 0x24:
              case 0x25:
              case 0x26:
              case 0x27:
                  r[dst] = r[dst]^r[src];
                  break;
              case 0x28:
              case 0x29:
              case 0x2A:
              case 0x2B:
                  r[dst] = r[dst]|r[src];
                  break;
              case 0x2C:
              case 0x2D:
              case 0x2E:
              case 0x2F:
                  r[dst] = r[src];
                  break;
              case 0x30:
              case 0x31:
              case 0x32:
              case 0x33:
              case 0x34:
              case 0x35:
              case 0x36:
              case 0x37:
              case 0x38:
              case 0x39:
              case 0x3A:
              case 0x3B:
              case 0x3C:
              case 0x3D:
              case 0x3E:
              case 0x3F:
                  H = 0;
                  setPostEvaluationFlags(r[smallReg] - bigConstant);
                  break;
              case 0x40:
              case 0x41:
              case 0x42:
              case 0x43:
              case 0x44:
              case 0x45:
              case 0x46:
              case 0x47:
              case 0x48:
              case 0x49:
              case 0x4A:
              case 0x4B:
              case 0x4C:
              case 0x4D:
              case 0x4E:
              case 0x4F:
                  r[smallReg] = r[smallReg] - bigConstant - C;
                  break;
              case 0x50:
              case 0x51:
              case 0x52:
              case 0x53:
              case 0x54:
              case 0x55:
              case 0x56:
              case 0x57:
              case 0x58:
              case 0x59:
              case 0x5A:
              case 0x5B:
              case 0x5C:
              case 0x5D:
              case 0x5E:
              case 0x5F:
                  r[smallReg] = r[smallReg] - bigConstant;
                  break;
              case 0x60:
              case 0x61:
              case 0x62:
              case 0x63:
              case 0x64:
              case 0x65:
              case 0x66:
              case 0x67:
              case 0x68:
              case 0x69:
              case 0x6A:
              case 0x6B:
              case 0x6C:
              case 0x6D:
              case 0x6E:
              case 0x6F:
                  r[smallReg] = r[smallReg] | bigConstant;
                  break;
              case 0x70:
              case 0x71:
              case 0x72:
              case 0x73:
              case 0x74:
              case 0x75:
              case 0x76:
              case 0x77:
              case 0x78:
              case 0x79:
              case 0x7A:
              case 0x7B:
              case 0x7C:
              case 0x7D:
              case 0x7E:
              case 0x7F:
                  H = 0;
                  r[smallReg] = r[smallReg] & bigConstant;
                  setPostEvaluationFlags(r[smallReg]);
                  C = 0;
                  break;
              case 0x80:
              case 0x81:
                  if(((params & 0x8) | 0x0) === 0x0){
                      var base = parseInt(r[dst], 16);
                      writeMemory(parseInt(r[28], 16), base);
                      writeMemory(parseInt(r[29], 16), ++base);
                  }
                  break;
              case 0x82:
              case 0x83:
                  if(((params & 0xF) | 0x0) === 0x0){
                      writeMemory((r[30]), r[dst]);
                      writeMemory((r[31]), r[dst]+1);
                  }
                  break;
              case 0x90:
              case 0x91:
                  if((params & 0xF) === 0xF){
                      r[dst] = memory[SP++];
                  }else if((params & 0xF) === 0x5){
                      r[dst] = ((r[31] << 0x8) | r[30]);
                      r[30]++;
                      if(r[30] === 0x100){
                          r[30] = 0;
                          r[31]++;
                      }
                  }else{
                     r[dst] = memory[parseInt(memory[PC++] << 0x4 | memory[PC++], 16)];
                  }
                  break;
              case 0x92:
              case 0x93:
                  if((params & 0xFF) === 0xF){
                      writeMemory(SP, r[dst]);
                      SP--;
                  }else if((params & 0xF) === 0xD){
                      writeMemory(parseInt(r[26], r[dst]));
                      writeMemory(parseInt(r[27], r[dst]+1));
                      r[26]++;
                      if(r[26] === 0x100){
                          r[26] = 0;
                          r[27]++;
                      }
                  }else{
                     writeMemory(parseInt(memory[PC++], 16), r[dst]);
                     writeMemory(parseInt(memory[PC++], 16), r[dst]+1);
                  }
                  break;
              case 0x94:
              case 0x95:
                  if((params & 0xFF) === 0x5){
                      var value = r[dst];
                      var topBit = value & 0x80;
                      var lowBit = value & 0x1;
                      value = value >> 0x1;
                      value = value | topBit;
                      setPostEvaluationFlags(value);
                      r[dst] = value;
                      C = lowBit;
                      V = N ^ C;
                  }else if((params & 0xFF) === 0x08){
                     var upper = memory[++SP];
                     PC = ((upper << 0x8)|memory[++SP]);
                  }
                  break;
              case 0x96:
                  H = 0;
                  r[upperPair] = constant & 0xF;
                  r[upperPair+1] = (constant & 0xF0) >> 0x4;
                  setPostEvaluationFlags(r[upperPair+1]);
                  if(r[upperPair] === 0x0 && r[upperPair+1] === 0x0){
                      Z = 1;
                  }else{
                      Z = 0;
                  }
                  break;
              case 0x97:
                  r[upperPair] = r[upperPair] - (constant & 0xF);
                  r[upperPair+1] = r[upperPair+1] - ((constant & 0xF0) >> 0x4);
                  break;
              case 0x9A:
                  var register = ioRegStart+regSet;
                  writeMemory(register, memory[register] | 1 << regVal);
                  break;
              case 0xB0:
              case 0xB1:
              case 0xB2:
              case 0xB3:
              case 0xB4:
              case 0xB5:
              case 0xB6:
              case 0xB7:
                  r[dst] = memory[ioRegStart+io];
                  break;
              case 0xB8:
              case 0xB9:
              case 0xBA:
              case 0xBB:
              case 0xBC:
              case 0xBD:
              case 0xBE:
              case 0xBF:
                  writeMemory(ioRegStart+io, r[dst]); 
                  break;
              case 0xC0:
              case 0xC1:
              case 0xC2:
              case 0xC3:
              case 0xC4:
              case 0xC5:
              case 0xC6:
              case 0xC7:
              case 0xC8:
              case 0xC9:
              case 0xCA:
              case 0xCB:
              case 0xCC:
              case 0xCD:
              case 0xCE:
              case 0xCF:
                  if((jumpConstant & 0x800) === 0x800){
                      PC-=4096-((jumpConstant ^ 0x800)*2);
                  }else{
                      PC+=jumpConstant*2;
                  }
                  break;
              case 0xD0:
              case 0xD1:
              case 0xD2:
              case 0xD3:
              case 0xD4:
              case 0xD5:
              case 0xD6:
              case 0xD7:
              case 0xD8:
              case 0xD9:
              case 0xDA:
              case 0xDB:
              case 0xDC:
              case 0xDD:
              case 0xDE:
              case 0xDF:
                  writeMemory(SP--, (PC & 0xFF));
                  writeMemory(SP--, (PC >> 0x8));
                  if((jumpConstant & 0x800) === 0x800){
                      PC-=4096-((jumpConstant ^ 0x800)*2);
                  }else{
                      PC+=jumpConstant*2;
                  }
                  break;
              case 0xE0:
              case 0xE1:
              case 0xE2:
              case 0xE3:
              case 0xE4:
              case 0xE5:
              case 0xE6:
              case 0xE7:
              case 0xE8:
              case 0xE9:
              case 0xEA:
              case 0xEB:
              case 0xEC:
              case 0xED:
              case 0xEE:
              case 0xEF:
                  r[smallReg] = bigConstant;
                  break;
              case 0xF0:
              case 0xF1:
              case 0xF2:
              case 0xF3:
                if(((params ^ 0x1) > 0x0) && Z){
                    if(breakDistance > 0x40)
                      PC-=(128-breakDistance)*2;
                    else
                      PC+=breakDistance;
                }
                break;
              case 0xF4:
              case 0xF5:
              case 0xF6:
              case 0xF7:
                  if(((params ^ 0x1) > 0x0) && !Z){
                      if(breakDistance > 0x40)
                        PC-=(128-breakDistance)*2;
                      else
                        PC+=breakDistance;
                    }
                  break;
              case 0xF8:
              case 0xF9:
                  r[dst] = T << (params & 0x7);
                  break;
              default:
                  document.write("unknown "+(PC-2)+" "+opcode+" "+params+"<br/>");
          }        
      }
    
      function loop(){
          var opcode = parseInt(memory[PC], 16);
          var params = parseInt(memory[++PC], 16);
          PC++;
          if(!(opcode == 0x95 && params == 0x98) && !(opcode == 0xCF && params == 0xFF))
              setTimeout(loop, 10);
          fetch(opcode, params);
          while(dataQueue.length > 0){
              writeDataToPort();
          } 
      }
    
      function exec(){
          PC=flashStart;
          for(i = 0; i < r.length; i++)
              r[i] = 0;
    
          loop();
      }