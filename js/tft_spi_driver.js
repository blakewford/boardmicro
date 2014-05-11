<script type="text/javascript">
var colset = 0;
var rowset = 0;
var datasent = 0;
function peripheralSPIWrite(c){
    if(((readMemory(portE) & 0x40) == 0)
         && ((readMemory(portD) & 0x4) == 0)){
        if(c == 0x2A){
            colset = 4;
        }else if(c == 0x2B){
            rowset = 4;
        }
    }else if(((readMemory(portE) & 0x40) == 0)
               && ((readMemory(portD) & 0x4) != 0)){
        if(colset > 0){
            optimizationEnabled = true;
            switch(colset){
                case 4:
                    writeMemory(0x7FF7, c);
                    break;
                case 3:
                    writeMemory(0x7FF6, c);
                    break;
                case 2:
                    writeMemory(0x7FF9, c);
                    break;
                case 1:
                    writeMemory(0x7FF8, c);
                    break;
            }
            colset--;
        }else if(rowset > 0){
            switch(rowset){
                case 4:
                    writeMemory(0x7FFB, c);
                    break;
                case 3:
                    writeMemory(0x7FFA, c);
                    break;
                case 2:
                    writeMemory(0x7FFD, c);
                    break;
                case 1:
                    writeMemory(0x7FFC, c);
                    break;
            }
            rowset--;
            optimizationEnabled = false;
        }else{
            if(datasent % 2 == 0){
                writeMemory(0x7FFE, c);
            }else{
                writeMemory(0x7FFF, c);
            }
            datasent++;
        }
    }
}
</script>
