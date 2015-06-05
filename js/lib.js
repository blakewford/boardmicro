  var emcc = false;
  var nokiaScreen = target == "atmega328";
  var arduboy = variant == "arduboy";
  screen_driver.setAttribute("type", "text/javascript");
  if(nokiaScreen)
  {
      screen_driver.setAttribute("src", "js/nokia_spi_driver.js");
  }
  else if(arduboy)
  {
      screen_driver.setAttribute("src", "js/oled_spi_driver.js");
  }
  else
  {
      screen_driver.setAttribute("src", "js/tft_spi_driver.js");
  }
  layout.appendChild(screen_driver);
  screen_buffer.width = nokiaScreen ? 84: arduboy ? 128: 160;
  screen_buffer.height = nokiaScreen ? 48: arduboy ? 64: 128;
  var scale = width/screen_buffer.width;

  function reportMhz(mhz)
  {
    document.getElementById("mhz").value = mhz.toString();
  }

  function handleDialogBreakpoint(object)
  {
      var context = document.getElementById(object.canvas).getContext("2d");
      context.beginPath();
      context.fillStyle = object.enabled ? "red": "gray";
      context.arc(canvas.width/2, canvas.height/2, 50, 0, 2*Math.PI);
      context.fill();
      var line_number = ((debug_source.scrollTop / 20)+1);
      line_number += parseInt(object.canvas);
  }

  var selected;
  var frameSource = [];
  function reportCallFrame(frame)
  {
        var callframe = document.createElement("li");
        callframe.appendChild(document.createTextNode(frame));
        callframe.addEventListener('click', function()
        {
            var source;
            var first = frame.split(" ")[0];
            var index = 0;
            while(index < frameSource.length)
            {
              if(frameSource[index].frame == first)
              {
                  source = frameSource[index];
                  debug_source.value = source.text;
                  source.line = (frame.split(" ")[2]*20/*line-height*/)-20;
                  setTimeout(function()
                  {
                    debug_source.scrollTop = source.line;
                  }, 10);
              }
              index++;
            }
            if(typeof source == "undefined")
            {
              source = {};
              source.frame = first;
              source.line = (frame.split(" ")[2]*20/*line-height*/)-20;
              source.text = "";
            }
            selected = source;
            source_dialog.showModal();
        });
        callstack.appendChild(callframe);
  }

  function closeDialog()
  {
    selected = null;
    debug_source.value = "";
    source_dialog.close();
  }

  function normalize(value, align)
  {
    var normal_value = Math.floor(value);
    return normal_value % align === 0 ? normal_value: normal_value - (normal_value % align);
  }

  function initScreen()
  {
      screen_canvas.width = width;
      screen_canvas.height = scale*screen_buffer.height;
      return screen_canvas.height;
  }

  function initPort(port_id, port_height)
  {
      var pin = document.getElementById(port_id);
      pin.width = normalize(width/port_width, port_width)-1;
      var device_width = (pin.width*port_width) + port_width;
      if(device_width < width)
      {
          pin.width += normalize((width-device_width)/port_width, 2);
      }
      pin.height = port_height;
      fillCanvas(pin, default_color);
  }

  function initLastPin(port_id, port_height)
  {
     initPort(port_id, port_height);
     var pin = document.getElementById(port_id);
     var device_width = (pin.width*port_width)+port_width;
     pin.width += width-device_width-1;
  }

  function initPorts(port_height)
  {
     initPort("B0",port_height);
     initPort("B1",port_height);
     initPort("B2",port_height);
     initPort("B3",port_height);
     initPort("B4",port_height);
     initPort("B5",port_height);
     initPort("B6",port_height);
     initLastPin("B7",port_height);

     initPort("C0",port_height);
     initPort("C1",port_height);
     initPort("C2",port_height);
     initPort("C3",port_height);
     initPort("C4",port_height);
     initPort("C5",port_height);
     initPort("C6",port_height);
     initLastPin("C7",port_height);

     initPort("D0",port_height);
     initPort("D1",port_height);
     initPort("D2",port_height);
     initPort("D3",port_height);
     initPort("D4",port_height);
     initPort("D5",port_height);
     initPort("D6",port_height);
     initLastPin("D7",port_height);

     initPort("E0",port_height);
     initPort("E1",port_height);
     initPort("E2",port_height);
     initPort("E3",port_height);
     initPort("E4",port_height);
     initPort("E5",port_height);
     initPort("E6",port_height);
     initLastPin("E7",port_height);

     initPort("F0",port_height);
     initPort("F1",port_height);
     initPort("F2",port_height);
     initPort("F3",port_height);
     initPort("F4",port_height);
     initPort("F5",port_height);
     initPort("F6",port_height);
     initLastPin("F7",port_height);
  }

  function initFileInput()
  {
      if(useDropbox){
          var options =
          {
            success: function(files) {
                var url = files[0].link;
                var client = new XMLHttpRequest();
                client.open("GET", url, true);
                client.setRequestHeader("Content-Type", "text/plain");
                client.onreadystatechange = function()
                {
                    if(client.readyState==4 && client.status==200)
                    {
                      frameSource = [];
                      isPaused = true;
                      if(emcc)
                      {
                        var lines = client.responseText.split("\n");
                        var numLines = lines.length-1;
                        for(var current = 0; current < numLines; current++)
                        {
                          Module.ccall('loadPartialProgram',null,['string'],[lines[current]]);
                        }
                        UseEmccClicks();
                        Module.ccall('engineInit', null, ['string'],[target]);
                        initScreen();
                        execProgram();
                      }
                      else
                      {
                        loadMemory(client.responseText);
                        engineInit();
                        exec();
                      }
                    }
                }
                client.send();
            },
            linkType: "direct",
            extensions: ['.hex'],
         };
        file_input.style.display = "none";
        sources.appendChild(Dropbox.createChooseButton(options));
        options =
        {
          success: function(files) {
          var url = files[0].link;
          var client = new XMLHttpRequest();
          client.open("GET", url, true);
          client.setRequestHeader("Content-Type", "text/plain");
          client.onreadystatechange = function()
          {
            if(client.readyState==4 && client.status==200)
            {
              selected.text = client.responseText;
              frameSource.push(selected);
              debug_source.value = selected.text;
              setTimeout(function()
              {
                debug_source.scrollTop = selected.line;
              }, 10);
            }
          }
          client.send();
          },
          linkType: "direct",
          extensions: ['.c','.cpp'],
        };
        source_input.style.display = "none";
        source_dialog.insertBefore(Dropbox.createChooseButton(options), source_dialog.childNodes[0]);
      }
      else
      {
          file_input.addEventListener('change', function(evt)
          {
            var file = file_input.files[0];
            if(!file)
            {
              alert('Intel Hex File Required');
              return;
            }
            var reader = new FileReader();
            reader.onloadend = function(evt)
            {
              if(evt.target.readyState == FileReader.DONE)
              {
                var bytes = evt.target.result;
                if( bytes.charCodeAt(0) == 0x7f && bytes[1] == 'E' && bytes[2] == 'L' && bytes[3] == 'F' )
                {
                  intelhex = getHexFromElf(bytes);
                  buildFrameInfo();
                  buildLineInfo();
                }else{
                  intelhex = evt.target.result;
                }
                frameSource = [];
                if(emcc)
                {
                  var lines = intelhex.split("\n");
                  var numLines = lines.length-1;
                  for(var current = 0; current < numLines; current++)
                  {
                    Module.ccall('loadPartialProgram',null,['string'],[lines[current]]);
                  }
                  Module.ccall('engineInit', null, ['string'],[target]);
                  initScreen();
                  execProgram();
                }
                else
                {
                  loadMemory(intelhex);
                  engineInit();
                  exec();
                }
              }
            };
            reader.readAsBinaryString(file.slice(0, file.size));
          }, false);
          source_input.addEventListener('change', function(evt)
          {
            var file = source_input.files[0];
            if(!file)
            {
              return;
            }
            var reader = new FileReader();
            reader.onloadend = function(evt)
            {
              if(evt.target.readyState == FileReader.DONE)
              {
                  selected.text = evt.target.result;
                  frameSource.push(selected);
                  debug_source.value = selected.text;
                  setTimeout(function()
                  {
                    debug_source.scrollTop = selected.line;
                  }, 10);
              }
            };
            reader.readAsBinaryString(file.slice(0, file.size));
            source_input.value = '';
          }, false);
      }
  }

  function fillCanvas(canvas, color)
  {
      var context = canvas.getContext('2d');
      switch(color)
      {
          case "red":
              color = "#FF0000";
              break;
          case "green":
              color = "#00FF00";
              break;
          case "black":
              color = "#000000";
              break;
      }
      var imgData = context.getImageData(0,0,canvas.width,canvas.height);
      var cursor = canvas.width*canvas.height*4;
      while((cursor-=4))
      {
        imgData.data[cursor]   = parseInt(color.substr(1,2),16);
        imgData.data[cursor+1] = parseInt(color.substr(3,2),16);
        imgData.data[cursor+2] = parseInt(color.substr(5),16);
        imgData.data[cursor+3] = 0xFF;
      }
      imgData.data[cursor]   = parseInt(color.substr(1,2),16);
      imgData.data[cursor+1] = parseInt(color.substr(3,2),16);
      imgData.data[cursor+2] = parseInt(color.substr(5),16);
      imgData.data[cursor+3] = 0xFF;
      context.putImageData(imgData, 0, 0);
  }

  function refreshScreen()
  {
      var context = screen_canvas.getContext('2d');
      context.scale(scale,scale);
      context.drawImage(screen_buffer, 0, 0);
      context.scale(1/scale,1/scale);
  }

  function pinNumberToPinObject(pin_number)
  {
    var pin = null;
    switch(pin_number)
    {
      case 0:
        pin = B0;
        break;
      case 1:
        pin = B1;
        break;
      case 2:
        pin = B2;
        break;
      case 3:
        pin = B3;
        break;
      case 4:
        pin = B4;
        break;
      case 5:
        pin = B5;
        break;
      case 6:
        pin = B6;
        break;
      case 7:
        pin = B7;
        break;
      case 8:
        pin = C0;
        break;
      case 9:
        pin = C1;
        break;
      case 10:
        pin = C2;
        break;
      case 11:
        pin = C3;
        break;
      case 12:
        pin = C4;
        break;
      case 13:
        pin = C5;
        break;
      case 14:
        pin = C6;
        break;
      case 15:
        pin = C7;
        break;
      case 16:
        pin = D0;
        break;
      case 17:
        pin = D1;
        break;
      case 18:
        pin = D2;
        break;
      case 19:
        pin = D3;
        break;
      case 20:
        pin = D4;
        break;
      case 21:
        pin = D5;
        break;
      case 22:
        pin = D6;
        break;
      case 23:
        pin = D7;
        break;
      case 26:
        pin = E6;
        break;
      case 30:
        pin = E7;
        break;
      case 32:
        pin = F0;
        break;
      case 33:
        pin = F1;
        break;
      case 36:
        pin = F4;
        break;
      case 37:
        pin = F5;
        break;
      case 38:
        pin = F6;
        break;
      case 39:
        pin = F7;
        break;
    }

    return pin;
  }

  function popPortBuffer(queue, port)
  {
      if(!optimizationEnabled && !(forceOptimizationEnabled && (port == spipinport1*8 || port == spipinport2*8)))
      {
        var pin = null;
        // Disable all port pins
        for(i = 0; i < bitsPerPort; i++)
        {
          pin = pinNumberToPinObject(parseInt(i + port));
          if(pin)
          {
            //IsGreen?
            var data = pin.getContext('2d').getImageData(0, 0, 1, 1).data[1];
            if(data == 0xFF)
            {
              fillCanvas(pin, red_color);
            }
          }
        }
        queue = queue.shift();
        // Enable selected port pins
        for(i = 0; i < bitsPerPort; i++)
        {
           if(parseInt(queue) & 1 << i)
           {
             pin = pinNumberToPinObject(parseInt(i + port));
             if(pin)
             {
               fillCanvas(pin, green_color);
             }
           }
        }
      }
      else{
          queue.shift();
      }
  }

  function uartWrite(data)
  {
      uart.value.length == uartBufferLength - 1 && (uart.value = "");
      uart.value += String.fromCharCode(data);
  }

  function drawPixel(x, y, color)
  {
      if( x > screen_buffer.width-1 || y > screen_buffer.height-1 )
      {
        return;
      }
      var context = screen_buffer.getContext('2d');
      var imgData = context.getImageData(x,y,1,1);
      imgData.data[0] = parseInt(color.substr(1,2),16);
      imgData.data[1] = parseInt(color.substr(3,2),16);
      imgData.data[2] = parseInt(color.substr(5),16);
      imgData.data[3] = 0xFF;
      context.putImageData(imgData, x, y);
  }

  function fillScreen(color)
  {
      for(var y = 0; y < screen_buffer.height; y++)
      {
        for(var x = 0; x < screen_buffer.width; x++)
        {
          drawPixel( x, y, color );
        }
      }
  }

  function handleBreakpoint(address)
  {
      var index = softBreakpoints.indexOf(parseInt(address, 16)-flashStart+2);
      if(index >= 0)
      {
        alert("Breakpoint at 0x" + softBreakpoints[index].toString(16));
      }
  }

  function filterRelevantKeypress()
  {
      switch(event.which)
      {
        case 13:
            doDebugCommand();
            break;
        case 38:
            gdb_window.value = historyIndex >= 0 ?
            commandHistory[historyIndex--]: "";
            break;
      }
  }

  function writeMemoryWindow()
  {
    var i = SP;
    disasm.value = "";
    while(i < flashStart)
    {
      disasm.value += memory[i].toString(16) + " ";
      i++;
    }
  }

  function writeRegisterWindow()
  {
      R0.value = r[0].toString(16);
      R1.value = r[1].toString(16);
      R2.value = r[2].toString(16);
      R3.value = r[3].toString(16);
      R4.value = r[4].toString(16);
      R5.value = r[5].toString(16);
      R6.value = r[6].toString(16);
      R7.value = r[7].toString(16);
      R8.value = r[8].toString(16);
      R9.value = r[9].toString(16);
      R10.value = r[10].toString(16);
      R11.value = r[11].toString(16);
      R12.value = r[12].toString(16);
      R13.value = r[13].toString(16);
      R14.value = r[14].toString(16);
      R15.value = r[15].toString(16);
      R16.value = r[16].toString(16);
      R17.value = r[17].toString(16);
      R18.value = r[18].toString(16);
      R19.value = r[19].toString(16);
      R20.value = r[20].toString(16);
      R21.value = r[21].toString(16);
      R22.value = r[22].toString(16);
      R23.value = r[23].toString(16);
      R24.value = r[24].toString(16);
      R25.value = r[25].toString(16);
      R26.value = r[26].toString(16);
      R27.value = r[27].toString(16);
      R28.value = r[28].toString(16);
      R29.value = r[29].toString(16);
      R30.value = r[30].toString(16);
      R31.value = r[31].toString(16);
  }

  function writeBreakpointWindow()
  {
    while(breakpoints.firstChild)
    {
        breakpoints.removeChild(breakpoints.firstChild);
    }
    var i = softBreakpoints.length;
    while(i--)
    {
        var address = softBreakpoints[i]+flashStart;
        var breakpoint = document.createElement("li");
        if( PC == address )
        {
            breakpoint.style.color = "red";
        }
        breakpoint.appendChild(document.createTextNode(getDecodedLine(address)));
        breakpoints.appendChild(breakpoint);
    }
  }

  function doDebugCommand()
  {
      var command = gdb_window.value;
      commandHistory.push(command);
      historyIndex = commandHistory.length-1;
      handleDebugCommandString(command);
      gdb_window.value = "";
      writeMemoryWindow();
      writeRegisterWindow();
      writeBreakpointWindow();
      while(callstack.firstChild)
      {
        callstack.removeChild(callstack.firstChild);
      }
      backtrace(PC);
      gdb_window.focus();
  }

  function setDebugResult(result)
  {
      result_window.textContent = result;
  }

  function customizePortsLayout(element)
  {
      default_port_layout.style.display = "none";
      ports.appendChild(element);
  }

  //New API
  var shouldBeBitsPerPort = 8;
  var bState, cState, dState, eState, fState;
  function writePort(port, value)
  {
      switch(port)
      {
        case 0:
          bState = value;
          break;
        case 1:
          cState = value;
          break;
        case 2:
          dState = value;
          break;
        case 3:
          eState = value;
          break;
        case 4:
          fState = value;
          break;
      }
  }

  function execProgram()
  {
    var start = new Date().getTime();
    var success = Module.ccall('fetchN', 'number', ['number'], [batchSize]);
    var end = new Date().getTime();
    var mhz = (batchSize/(end-start))/1000;
    reportMhz(mhz);
    success && setTimeout(execProgram, batchDelay);
  }

  function refreshPort(port, value)
  {
    var pin = null;
    // Disable all port pins
    for(i = 0; i < shouldBeBitsPerPort; i++)
    {
      pin = pinNumberToPinObject(parseInt(i + port*8));
      if(pin)
      {
        //IsGreen?
        var data = pin.getContext('2d').getImageData(0, 0, 1, 1).data[1];
        if(data == 0xFF)
        {
          fillCanvas(pin, red_color);
        }
      }
    }
    // Enable selected port pins
    for(i = 0; i < shouldBeBitsPerPort; i++)
    {
      if(parseInt(value) & 1 << i)
      {
        pin = pinNumberToPinObject(parseInt(i + port*8));
        if(pin)
        {
          fillCanvas(pin, green_color);
        }
      }
    }
  }

  function refreshUI()
  {
    refreshScreen();
    refreshPort(0, bState);
    refreshPort(1, cState);
    refreshPort(2, dState);
    refreshPort(3, eState);
    refreshPort(4, fState);
  }
