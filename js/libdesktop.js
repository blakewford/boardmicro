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
