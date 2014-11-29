    function isNumber(c) {
        return !isNaN(parseInt(c, 16))
    }
    function setPin(c, b) {
        var d = document.getElementById(c).getContext("2d");
        d.fillStyle = b;
        d.fillRect(0, 0, 10, 10)
    }
    function filterRelevantKeypress()
    {
        switch(event.which){
            case 13:
                doDebugCommand();
                break;
            case 38:
                document.getElementById("gdb").value = historyIndex >= 0 ?
                    commandHistory[historyIndex--]: "";
                break;
        }
    }
    function doDebugCommand() {
        var c = document.getElementById("gdb").value;
        commandHistory.push(c);
        historyIndex = commandHistory.length-1;
        handleDebugCommandString(c);
        document.getElementById("gdb").value = "";
        document.getElementById("gdb").focus();
    }
    function setDebugResult(c) {
        document.getElementById("gdbshell").textContent = c;
    }
    function normalize(value){
        return value.length == 2 ? value: "0"+ value;
    }
    function popPortBuffer(b, d){
        if(!optimizationEnabled && !(forceOptimizationEnabled && (d == spipinport1*8 || d == spipinport2*8))){
            for (i = 0; i < bitsPerPort; i++)c = "pin" + parseInt(i + d), 0 < document.getElementById(c).getContext("2d").getImageData(0, 0, 10, 10).data[1] && setPin(c, "#FF0000");
                b = b.shift();
            for (i = 0; i < bitsPerPort; i++) parseInt(b) & 1 << i && setPin("pin" + parseInt(i + d), "#00FF00")
        }else{
            b.shift();
        }
    }
    function uartWrite(c){
        var b = document.getElementById("uart");
        b.value.length == uartBufferLength - 1 && (b.value = "");
        b.value += String.fromCharCode(c)
    }
    function drawPixel(x, y, color){
        var nokiaScreen = target == "atmega328";
        var height = nokiaScreen ? 48: 128;
        var width  = nokiaScreen ? 84: 160;
        if( x > width-1 || y > height-1 )
            return;
        var id = normalize(x.toString(16));
        id+=normalize(y.toString(16));
        var element = document.getElementById(id);
        element.style.background = color;
    }
    function fillScreen(color){
        var nokiaScreen = target == "atmega328";
        var height = nokiaScreen ? 48: 128;
        var width  = nokiaScreen ? 84: 160;
        for(var y = 0; y < height; y++)
        {
          for(var x = 0; x < width; x++)
          {
              drawPixel( x, y, color );
          }
        }
    }
    function handleBreakpoint(address){
        var index = softBreakpoints.indexOf(parseInt(address, 16)-flashStart+2);
        if(index >= 0){
            alert("Breakpoint at 0x" + softBreakpoints[index].toString(16));
        }
    }
    var commandHistory = [];
    var historyIndex = -1;
    var useDropbox = (typeof Dropbox != "undefined");
    if(useDropbox){
      var options = {
        success: function(files) {
          var url = files[0].link;
          var client = new XMLHttpRequest();
          client.open("GET", url, true);
          client.setRequestHeader("Content-Type", "text/plain");
          client.onreadystatechange = function(){
            if (client.readyState==4 && client.status==200)
            {
              loadMemory(client.responseText);
              engineInit();
              isPaused = true;
              exec();
            }
          }
          client.send();
        },
        linkType: "direct",
        extensions: ['.hex'],
      };
      document.getElementById("hexfile").style.display = "none";
      document.getElementById("sources").appendChild(Dropbox.createChooseButton(options));
    }
    else{
      document.getElementById('hexfile').addEventListener('change', function(evt) {
        var file = document.getElementById('hexfile').files[0];
        if (!file) {
          alert('Intel Hex File Required');
          return;
        }
        var reader = new FileReader();
        reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) {
            var bytes = evt.target.result;
            if( bytes.charCodeAt(0) == 0x7f && bytes[1] == 'E' && bytes[2] == 'L' && bytes[3] == 'F' ){
              readelfHeader(bytes);
              readelfSection(bytes, ".text");
              intelhex = "";
            }else{
              intelhex = evt.target.result;
            }
            loadMemory(intelhex);
            engineInit();
            exec();
          }
        };
        reader.readAsBinaryString(file.slice(0, file.size));
      }, false);
    }
