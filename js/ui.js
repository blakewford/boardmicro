    function isNumber(c) {
        return !isNaN(parseInt(c, 16))
    }
    function setPin(c, b) {
        var d = document.getElementById(c).getContext("2d");
        d.fillStyle = b;
        d.fillRect(0, 0, 10, 10)
    }
    function generatePortHtml(c, b) {
        var d = 8 * c,
        g = '<div style="display: table-row">';
        for (i = 0; 8 > i; i++) {
            var e = parseInt(d + i),
            g = g + ('<div style="display: table-cell;">  <canvas id="pin' + e + '" width="10" height="10"/> </div>');
            0 < (1 << i & b) && (g += '<script>setPin("pin' + e + '", "#FF0000");\x3c/script>')
        }
        return g + "</div>"
    }
    function generateRegisterHtml(c) {
        return '<textarea id="register' + c + '" rows="1" cols="4">0x00</textarea>'
    }
    function generateFillerHtml() {
        return '<div style="display: table-cell;"><canvas width="10" height="10"/></div>'
    }
    function filterRelevantKeypress()
    {
        switch(event.which){
            case 13:
                doDebugCommand();
                break;
            case 38:
                document.getElementById("gdb").value = historyIndex >= 0 ?
                    history[historyIndex--]: "";
                break;
        }
    }
    function doDebugCommand() {
        var c = document.getElementById("gdb").value;
        history.push(c);
        historyIndex = history.length-1;
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
        if(!optimizationEnabled && !(forceOptimizationEnabled && (d == 16 || d == 24))){
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
        if( x > 159 || y > 127 )
            return;
        var id = normalize(x.toString(16));
        id+=normalize(y.toString(16));
        var element = document.getElementById(id);
        element.style.background = color;
    }
    function handleBreakpoint(address){
        var index = softBreakpoints.indexOf(parseInt(address, 16)-flashStart+2);
        if(index >= 0){
            alert("Breakpoint at 0x" + softBreakpoints[index].toString(16));
        }
    }
    function generateScreen(){
        for(var j =0; j < 128; j++){
            document.write("<tr>");
            for(var i =0; i < 160; i++){
                var id = normalize(i.toString(16));
                id+=normalize(j.toString(16));
                document.write("<td id=\""+id+"\" style=\"background-color: black;\"></td>");
            }
            document.write("</tr>");
        }
    }
    var mobile = false;
    var history = [];
    var historyIndex = -1;
    if (screen.width <= 699) {
        mobile = true;
    }
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
    document.getElementById("sources").appendChild(Dropbox.createChooseButton(options));
    var colset = 0;
    var rowset = 0;
    var datasent = 0;
    if(mobile){
        document.getElementById("debug").style.display = "none";
    }
