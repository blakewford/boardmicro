// Globals

var all = document.getElementById('all');

var B0 = document.getElementById('B0');
var B1 = document.getElementById('B1');
var B2 = document.getElementById('B2');
var B3 = document.getElementById('B3');
var B4 = document.getElementById('B4');
var B5 = document.getElementById('B5');
var B6 = document.getElementById('B6');
var B7 = document.getElementById('B7');
var C6 = document.getElementById('C6');
var C7 = document.getElementById('C7');
var D0 = document.getElementById('D0');
var D1 = document.getElementById('D1');
var D2 = document.getElementById('D2');
var D3 = document.getElementById('D3');
var D4 = document.getElementById('D4');
var D5 = document.getElementById('D5');
var D6 = document.getElementById('D6');
var D7 = document.getElementById('D7');
var E2 = document.getElementById('E2');
var E6 = document.getElementById('E6');
var F0 = document.getElementById('F0');
var F1 = document.getElementById('F1');
var F4 = document.getElementById('F4');
var F5 = document.getElementById('F5');
var F6 = document.getElementById('F6');
var F7 = document.getElementById('F7');

var R0 = document.getElementById('R0');
var R1 = document.getElementById('R1');
var R2 = document.getElementById('R2');
var R3 = document.getElementById('R3');
var R4 = document.getElementById('R4');
var R5 = document.getElementById('R5');
var R6 = document.getElementById('R6');
var R7 = document.getElementById('R7');
var R8 = document.getElementById('R8');
var R9 = document.getElementById('R9');
var R10 = document.getElementById('R10');
var R11 = document.getElementById('R11');
var R12 = document.getElementById('R12');
var R13 = document.getElementById('R13');
var R14 = document.getElementById('R14');
var R15 = document.getElementById('R15');
var R16 = document.getElementById('R16');
var R17 = document.getElementById('R17');
var R18 = document.getElementById('R18');
var R19 = document.getElementById('R19');
var R20 = document.getElementById('R20');
var R21 = document.getElementById('R21');
var R22 = document.getElementById('R22');
var R23 = document.getElementById('R23');
var R24 = document.getElementById('R24');
var R25 = document.getElementById('R25');
var R26 = document.getElementById('R26');
var R27 = document.getElementById('R27');
var R28 = document.getElementById('R28');
var R29 = document.getElementById('R29');
var R30 = document.getElementById('R30');
var R31 = document.getElementById('R31');

var debug_source = document.getElementById('debug_source');
var source_dialog = document.getElementById('source_dialog');
var layout = document.getElementById('layout');
var disasm = document.getElementById('disasm');
var screen_canvas = document.getElementById("screen");
var uart = document.getElementById("uart");
var debug = document.getElementById("debug");
var state = document.getElementById("state");
var sources = document.getElementById("sources");
var ports = document.getElementById("ports");
var default_port_layout = document.getElementById("default");
var file_input = document.getElementById("file");
var source_input = document.getElementById("source");
var breakpoints = document.getElementById("breakpoints");
var callstack = document.getElementById("callstack");
var addresses = document.getElementById("addresses");
var red_color = "#FF0000";
var green_color = "#00FF00"
var default_color = "#626269";
var screen_buffer = document.createElement("canvas");
var screen_driver = document.createElement("script");
var gdb_window = document.getElementById("gdb");
var result_window = document.getElementById("gdbshell");
var mhz = document.getElementById("mhz");
// Platform specific
var num_ports = 5
var port_width = 8;

var max_width = 480;
var max_height = 720;
var use_orientation = "undefined" != typeof window.orientation;

function isLandscape()
{
  if(use_orientation)
  {
    return Math.abs(window.orientation) == 90;
  }
  else
  {
    return screen.width > screen.height;
  }
}

function isPortrait()
{
  return !isLandscape();
}

function isTablet()
{
  return isPortrait() ? (screen.width > 424): (screen.height > 424);
}

function isPhone()
{
    return !isTablet();
}

var scale = 1;
var width = screen.width > max_width ? max_width: screen.width;
var height = screen.height > max_height ? max_height: screen.height;

if(isPhone() && isLandscape())
{
  width = height*2/3;
}

if(isTablet() && isLandscape())
{
  scale = 0.9;
  if(use_orientation)
  {
    height = screen.width;
    width = screen.height*1/3;
  }
  else
  {
    width = screen.width*1/3;
    height = screen.height;
  }
}

if(!isTablet() || isPortrait())
{
 debug.style.display = "none";
 state.style.display = "none";
}

width = width*scale;
height = height*scale;

var commandHistory = [];
var historyIndex = -1;