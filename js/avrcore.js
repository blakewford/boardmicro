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
      
      function generatePortHtml(index, mask){
        var offset = 0x8*index;
        var portString = "<div style=\"display: table-row\">"; 
        for(i=0; i < 8; i++){
            var id = parseInt(offset+i);
            portString+="<div style=\"display: table-cell;\">  <canvas id=\"led"+id+"\" width=\"10\" height=\"10\"/> </div>";
            if(((0x1 << i) & mask) > 0){
                portString+="<script>"+"fillLED(\"led"+id+"\", \"#FF0000\");"+"</"+"script>";
            }
        }
        return portString+"</div>";
      }
    
      /*
      //ATTiny4
      var memory = new Array(0x4400);
      var flashStart = 0x4000;
      var dataStart = 0x40;
      var dataEnd = 0x60;
      var ioRegStart = 0x0;
      var portB = 0x2;
      var portC = 0xDEAD;
      var pllCsr = 0xDEAD;
      var bitsPerPort = 0x4;
      */
    
      /*
      //ATMega8
      var memory = new Array(0x2000);
      var flashStart = 0x460;
      var dataStart = 0x60;
      var dataEnd = 0x460; 
      var ioRegStart = 0x20;
      var portB = 0x38;
      var portC = 0x35;
      var pllCsr = 0xDEAD;
      var bitsPerPort = 0x8;
      */
      
      //ATMega32u4
      var memory = new Array(0x8000);
      var flashStart = 0xB00;
      var dataStart = 0x100;
      var dataEnd = 0xB00; 
      var ioRegStart = 0x20;
      var portB = 0x25;
      var portC = 0x28;
      var pllCsr = 0x49;
      var bitsPerPort = 0x8;
      var vectorBase = flashStart+0xAC;
      var usbVectorBase = vectorBase+0x1AE;

      var signatureOffset = flashStart+0xB2;
      var jumpTableAddress = usbVectorBase+0x40;
      var mainAddress = usbVectorBase+0x48;
      var calculatedOffset = 0x0;

      var PC = flashStart;
      var SP = 0x5F;
      var r = new Array(32);
      var SREG, C, Z, N, V, S, H, T, I;
    
      var dataQueueB = [];
      var dataQueueC = [];
      var softBreakpoints = [];
      var isPaused = true;
      var forceBreak = false;
      var hasDeviceSignature = false;
      
      function writeClockRegister(data){
          if((data & 0x02) > 0)
            memory[pllCsr] |= 0x1;
          else
            memory[pllCsr] &= 0xFE;          
      }
      
      function writeSpecificPort(index){
          var queue;
          var offset = 0x8*index;
          switch(index){
              case 0:
                  queue = dataQueueB;
                  break;
              case 1:
                  queue = dataQueueC;
                  break;              
          }
          var id = "led"+parseInt(i+offset);
          var c=document.getElementById(id);
          var ctx=c.getContext("2d");
          var imgData=ctx.getImageData(0,0,10,10);
          for(i = 0; i < bitsPerPort; i++){
              if(imgData.data[1] > 0)
                fillLED("led"+parseInt(i+offset), "#FF0000");
          }
          var data = queue.shift();
          for(i = 0; i < bitsPerPort; i++){
              if(parseInt(data) & (0x1 << i))
                  fillLED("led"+parseInt(i+offset), "#00FF00");
          }          
      }
    
      function writeMemory(address, data){
          memory[address] = data;
          if(address == portB)
              dataQueueB.push(data);
          if(address == portC)
              dataQueueC.push(data);
          if(address == pllCsr)
              writeClockRegister(data);
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
                  writeMemory(flashStart+offset+k, word.substring(0,2));
                  writeMemory(flashStart+offset+k+1, word.substring(2));
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
          var register = ioRegStart+regSet
          var breakDistance = ((opcode & 0x3) << 0x5) | ((params & 0xF0) >> 0x3) | ((params & 0x8) >> 0x3);
          var long = ((opcode & 0x1) << 20 | (params & 0xF0) << 17 | (params & 0x1) << 16 | 
              parseInt(memory[PC+1], 16) << 0x8 | parseInt(memory[PC], 16))*2;
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
                  var prev = Z;
                  var result = r[dst] - r[src] + C;
                  setPostEvaluationFlags(result);
                  if(result === 0x0)
                    Z = prev;
                  else
                    Z = 0;
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
              case 0x14:
              case 0x15:
              case 0x16:
              case 0x17:
                  setPreEvaluationFlags(r[dst], r[src]);
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
                  if(r[smallReg] > 0 ^ bigConstant > 0)
                    r[smallReg] = r[smallReg] - bigConstant - C;
                  C = Math.abs(r[smallReg]) < (bigConstant+C);
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
                  if(r[smallReg] < 0x0){
                    r[smallReg] = 0xFF - r[smallReg];
                    C = 1;
                  }
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
                      writeMemory((r[31] << 0x8 | r[30]), r[dst]);
                  }
                  break;
              case 0x90:
              case 0x91:
                  if((params & 0xF) === 0xF){
                      r[dst] = memory[SP++];
                  }else if((params & 0xF) === 0x4 || (params & 0xF) === 0x5){
                      var resolvedValue = ((r[31] << 0x8) | r[30]);
                      var address = ((resolvedValue >> 0x1)*2)+flashStart
                      var value = memory[address];
                      if((resolvedValue & 0x1) === 0x0)
                        r[dst] = parseInt(value & 0xFF, 16);
                      else
                        r[dst] = parseInt((value & 0xFF00) >> 0x8, 16);
                      if((params & 0xF) === 0x5){
                        r[30]++;
                        if(r[30] === 0x100){
                          r[30] = 0;
                          r[31]++;
                        }
                      }
                  }else{
                     r[dst] = memory[parseInt(memory[PC++], 16) | (parseInt(memory[PC++], 16) << 0x8)];
                  }
                  break;
              case 0x92:
              case 0x93:
                  if((params & 0xF) === 0xF){
                      writeMemory(SP, r[dst]);
                      SP--;
                  }else if((params & 0xF) === 0xD){
                      var lower = parseInt(r[26]);
                      var upper = parseInt(r[27]) << 0x8;
                      writeMemory(upper | lower, r[dst]);
                      r[26]++;
                      if(r[26] === 0x100){
                          r[26] = 0;
                          r[27]++;
                      }
                  }else{
                     writeMemory(parseInt(memory[PC++], 16), r[dst]+1);
                     writeMemory(parseInt(memory[PC++], 16), r[dst]);
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
                  }else if((params & 0xFF) === 0x09){
                     PC = ((r[31] << 0x8) | r[30])+flashStart;
                  }else if((params & 0x0F) === 0x0C || (params & 0x0F) === 0x0D){
                    PC = flashStart+long;
                  }else if((params & 0x0F) === 0x0E || (params & 0x0F) === 0x0F){
                    if(hasDeviceSignature && PC === jumpTableAddress+calculatedOffset){      //__tablejump__
                        PC = mainAddress+calculatedOffset;  //Go to main
                        break;
                    }
                    writeMemory(SP--, ((PC+2) & 0xFF));
                    writeMemory(SP--, ((PC+2) >> 0x8));
                    PC = flashStart+(parseInt(memory[PC+1], 16) << 0x8 | parseInt(memory[PC], 16))*2;
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
              case 0x98:
                  if((memory[register] & (1 << regVal)) > 0){
                    writeMemory(register, memory[register] ^ (1 << regVal));  
                  }
                  break;
              case 0x9A:
                  writeMemory(register, memory[register] | (1 << regVal));
                  break;
              case 0x9B:
                  if((memory[register] & (1 << regVal)) > 0){
                    PC+=2;  
                  }
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
                var jump = false;
                switch(params & 0x7){
                    case 0x0:
                        jump = C;
                        break;
                    case 0x1:
                        jump = Z;
                        break;
                }
                if(jump){
                    if(breakDistance > 0x40)
                        PC-=(128-breakDistance)*2;
                    else
                        PC+=breakDistance*2;
                }
                break;
              case 0xF4:
              case 0xF5:
              case 0xF6:
              case 0xF7:
                var jump = false;
                switch(params & 0x7){
                  case 0x0:
                    jump = !C;
                    break;
                  case 0x1:
                    jump = !Z;
                    break;
                }
                if(jump){
                  if(breakDistance > 0x40)
                    PC-=(128-breakDistance)*2;
                  else
                    PC+=breakDistance*2;
                }
                break;
              case 0xF8:
              case 0xF9:
                  r[dst] = T << (params & 0x7);
                  break;
              case 0xFC:
              case 0xFD:
                  if((r[dst] & (0x1 << (params & 0x7))) === 0)
                    PC+=2;
                  break;
              case 0xFE:
              case 0xFF:
                  if(r[dst] & (0x1 << (params & 0x7)) > 0)
                    PC+=2;
                  break;
              default:
                  document.write("unknown 0x"+(PC-2).toString(16).toUpperCase()+" "+opcode+" "+params+"<br/>");
          }        
      }
      
      function handleBreakpoint(address){
            alert('Breakpoint at 0x'+address);          
      }
      
      function isSoftBreakpoint(address){
          for(i =0; i < softBreakpoints.length; i++){
              if((softBreakpoints[i]+flashStart) === address)
                return true;
          }
          
          return false;
      }
    
      function loop(){
          var params = parseInt(memory[PC], 16);
          var opcode = parseInt(memory[++PC], 16);
          PC++;
          var isBreak = (opcode == 0x95 && params == 0x98) || isSoftBreakpoint(PC) || forceBreak;
          if(!isBreak && !(opcode == 0xCF && params == 0xFF))
              setTimeout(loop, 10);
          else if(isBreak){
              forceBreak = false;
              isPaused = true;
              handleBreakpoint((PC-2).toString(16).toUpperCase());
          }
          fetch(opcode, params);
          while((dataQueueB.length > 0) || (dataQueueC.length > 0)){
            writeSpecificPort(0);
            writeSpecificPort(1);
          } 
      }
      
      function engineInit(){
          for(i = 0; i < r.length; i++)
              r[i] = 0;
          var ctorEnd = 0x0;
          if(parseInt(memory[flashStart], 16) === 0xC)
            ctorEnd = flashStart+(parseInt(memory[flashStart+3],16) << 0x8 | parseInt(memory[flashStart+2], 16))*2;
          if(ctorEnd > usbVectorBase)
            calculatedOffset = ctorEnd - usbVectorBase;
          var id = new Array(0);
          for(i = signatureOffset+calculatedOffset; i < signatureOffset+calculatedOffset+32; i+=2)
            id.push(String.fromCharCode(parseInt(memory[i], 16)));
          switch(id.toString().replace(/,/g, "")){
            case "Arduino Micro   ":
              hasDeviceSignature = true;
              break;
          };
      }
    
      function exec(){
          if(isPaused){
            isPaused = false;  
            loop();
          }
      }
