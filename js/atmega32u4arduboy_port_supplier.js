function setupActivePorts()
{
  fillCanvas(B0, red_color);
  fillCanvas(B1, red_color);
  fillCanvas(B2, red_color);
  fillCanvas(B3, red_color);
  fillCanvas(B4, red_color);
  fillCanvas(B5, red_color);
  fillCanvas(B6, red_color);
  fillCanvas(B7, red_color);
  fillCanvas(C6, red_color);
  fillCanvas(C7, red_color);
  fillCanvas(D0, red_color);
  fillCanvas(D1, red_color);
  fillCanvas(D2, red_color);
  fillCanvas(D3, red_color);
  fillCanvas(D4, red_color);
  fillCanvas(D5, red_color);
  fillCanvas(D6, red_color);
  fillCanvas(D7, red_color);
  fillCanvas(E2, red_color);
  fillCanvas(E6, red_color);
  fillCanvas(F0, red_color);
  fillCanvas(F1, red_color);
  fillCanvas(F4, red_color);
  fillCanvas(F5, red_color);
  fillCanvas(F6, red_color);
  fillCanvas(F7, red_color);
}

function setupInactivePorts()
{
  fillCanvas(C0, default_color);
  fillCanvas(C1, default_color);
  fillCanvas(C2, default_color);
  fillCanvas(C3, default_color);
  fillCanvas(C4, default_color);
  fillCanvas(C5, default_color);
  fillCanvas(E0, default_color);
  fillCanvas(E1, default_color);
  fillCanvas(E3, default_color);
  fillCanvas(E4, default_color);
  fillCanvas(E5, default_color);
  fillCanvas(E7, default_color);
  fillCanvas(F2, default_color);
  fillCanvas(F3, default_color);
}

function drawButton(canvas, width, height, margin, color, pin)
{
  canvas.style.width = width;
  canvas.style.height = height;
  canvas.width = width;
  canvas.height = height;
  canvas.style.marginLeft = margin;
  canvas.style.background = "springgreen";
  canvas.onclick = function() { handlePinInput(pin); };
  var context = canvas.getContext("2d");
  context.beginPath();
  context.fillStyle = color;
  context.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, 2*Math.PI);
  context.fill();
}

function GetCustomLayout()
{
  var custom_ports = document.createElement("div");
  var button_height = port_layout_height/5;
  var button_width = width/9;

  var second_level_buttons = document.createElement("div");
  var up_button = document.createElement("canvas");
  up_button.id = "up";
  drawButton(up_button, button_width, button_height, button_width*2, "blue", 1);
  second_level_buttons.appendChild(up_button);

  var middle_buttons = document.createElement("div");
  var left_button = document.createElement("canvas");
  left_button.id = "left";
  drawButton(left_button, button_width, button_height, button_width*1, "blue", 23);
  var right_button = document.createElement("canvas");
  right_button.id = "right";
  drawButton(right_button, button_width, button_height, button_width*1, "blue", 0);
  middle_buttons.appendChild(left_button);
  middle_buttons.appendChild(right_button);

  var fourth_level_buttons = document.createElement("div");
  var down_button = document.createElement("canvas");
  down_button.id = "down";
  drawButton(down_button, button_width, button_height, button_width*2, "blue", 22);
  fourth_level_buttons.appendChild(down_button);

  var final_buttons = document.createElement("div");
  var fire_button = document.createElement("canvas");
  fire_button.id = "fire";
  drawButton(fire_button, button_width, button_height, button_width*6, "green", 39);
  var b_button = document.createElement("canvas");
  b_button.id = "b";
  drawButton(b_button, button_width, button_height, 0, "red", 18);
  final_buttons.appendChild(fire_button);
  final_buttons.appendChild(b_button);

  custom_ports.appendChild(second_level_buttons);
  custom_ports.appendChild(middle_buttons);
  custom_ports.appendChild(fourth_level_buttons);
  custom_ports.appendChild(final_buttons);

  custom_ports.style.background = "springgreen";
  return custom_ports;
}

function UseEmccClicks()
{
    document.getElementById("up").onclick =
        function() { Module.ccall('buttonHit',null,['number', 'number'],[0x23,0xEF]); };
    document.getElementById("left").onclick =
        function() { Module.ccall('buttonHit',null,['number', 'number'],[0x23,0xDF]); };
    document.getElementById("down").onclick =
        function() { Module.ccall('buttonHit',null,['number', 'number'],[0x23,0xBF]); };
    document.getElementById("right").onclick =
        function() { Module.ccall('buttonHit',null,['number', 'number'],[0x26,0x80]); };
    document.getElementById("fire").onclick =
        function() { Module.ccall('buttonHit',null,['number', 'number'],[0x2F,0x7F]); };
    document.getElementById("b").onclick =
        function() { Module.ccall('buttonHit',null,['number', 'number'],[0x2F,0xBF]); };
}
