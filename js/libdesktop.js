function popPortBuffer(c, b) 
{
  switch(b/8) 
  {
    case 0:
      console.log("PortB");
      break;
    case 1:
      console.log("PortC");
      break;
    case 2:
      console.log("PortD");
      break;
    case 3:
      console.log("PortE");
      break;
    case 4:
      console.log("PortF");
  }
  console.log(c[0]);
  c.shift();
}

function handleBreakpoint(c) 
{
  console.log("Breakpoint at 0x" + c);
}

function reportCallFrame(frame)
{
  console.log(frame);
}

function getCommandLineArgs()
{
  var length = process.argv.length;
  while(length--)
  {
    console.log(process.argv[length]);
  }
}

var fileSystem = require('fs');
fileSystem.readFile(process.argv[process.argv.length-1], 'utf8',
  function(error, hex)
  {
    if(error)
    {
      return console.log(error);
    }

    var emccBackend = false;
    var length = process.argv.length;
    while(length--)
    {
      emccBackend = process.argv[length] == "emcc";
      if(emccBackend)
      {
          break;
      }
    }

    if(emccBackend)
    {
        var lines = hex.split("\n");
        var numLines = lines.length-1;
        for(var current = 0; current < numLines; current++)
        {
           Module.ccall('loadPartialProgram',null,['string'],[lines[current]]);
        }
        Module.ccall('engineInit');
        Module.ccall('execProgram');
    }
    else
    {
        loadMemory(hex);
        engineInit();
        exec();
    }
  }
);
