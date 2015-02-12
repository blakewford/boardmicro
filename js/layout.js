// Essential layout functions
all.style.background = default_color;
var registerWidth = (width/8)-1;
addresses.style.width = registerWidth*8;
breakpoints.style.marginLeft = 4;
breakpoints.style.height = height/8;
callstack.style.marginLeft = 4;
callstack.style.height = height/8;
disasm.style.width = registerWidth*8;
disasm.style.height = height/8;
disasm.style.marginLeft = 4;
mhz.style.marginLeft = 4;
mhz.style.width = registerWidth;

R0.style.width = registerWidth;
R0.style.marginLeft = 4;
R1.style.width = registerWidth;
R2.style.width = registerWidth;
R3.style.width = registerWidth;
R4.style.width = registerWidth;
R5.style.width = registerWidth;
R6.style.width = registerWidth;
R7.style.width = registerWidth;
R8.style.width = registerWidth;
R8.style.marginLeft = 4;
R9.style.width = registerWidth;
R10.style.width = registerWidth;
R11.style.width = registerWidth;
R12.style.width = registerWidth;
R13.style.width = registerWidth;
R14.style.width = registerWidth;
R15.style.width = registerWidth;
R16.style.width = registerWidth;
R16.style.marginLeft = 4;
R17.style.width = registerWidth;
R18.style.width = registerWidth;
R19.style.width = registerWidth;
R20.style.width = registerWidth;
R21.style.width = registerWidth;
R22.style.width = registerWidth;
R23.style.width = registerWidth;
R24.style.width = registerWidth;
R24.style.marginLeft = 4;
R25.style.width = registerWidth;
R26.style.width = registerWidth;
R27.style.width = registerWidth;
R28.style.width = registerWidth;
R29.style.width = registerWidth;
R30.style.width = registerWidth;
R31.style.width = registerWidth;

var source_graphics_state = [];
var numRows = Math.floor((height*.5)/20);
while( numRows-- )
{
  var row = document.createElement("tr");
  var data = document.createElement("td");
  data.style.padding = 0;
  var canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = 20;
  canvas.style.background = "gray";
  canvas.id = numRows.toString();
  var object = {};
  object.enabled = false;
  object.canvas = canvas.id;
  source_graphics_state.unshift(object);
  canvas.addEventListener('click', function()
  {
      var object = source_graphics_state[parseInt(this.id)];
      object.enabled = !object.enabled;
      handleDialogBreakpoint(object);
  });
  data.appendChild(canvas);
  row.appendChild(data);

  graphics.appendChild(row);
}

layout.style.width = width;
uart.style.width = width;
source_dialog.style.height = height*.55;
var uart_height = normalize(height/25, 2);
uart.style.height = uart_height;
debug.style.background = default_color;
debug.style.width = width;
state.style.width = width;
sources.style.background = "black";
var sources_height = normalize(height/21, 2);
sources.style.height = sources_height;
var screen_height = initScreen();
fillCanvas(screen_canvas,"black");
fillCanvas(screen_buffer,"black");
var port_layout_height = height-screen_height-uart_height-sources_height;
var port_height = normalize(port_layout_height/num_ports, 2);
initPorts(port_height);
setupActivePorts();
setupInactivePorts();
initFileInput();
var dialog_supported = document.createElement('dialog').open;
if("undefined" != typeof dialog_supported)
{
    source_dialog.hidden = false;
}
if("undefined" != typeof GetCustomLayout)
{
    customizePortsLayout(GetCustomLayout());
}