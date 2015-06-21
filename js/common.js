//New API
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
