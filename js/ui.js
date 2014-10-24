   function normalize(value){
        return value.length == 2 ? value: "0"+ value;
    }

module.exports = {
    generatePortHtml: function(c) {
        var d = 8 * c,
        g = '<div style="display: table-row">';
        for (i = 0; 8 > i; i++) {
            var e = parseInt(d + i),
            g = g + ('<div style="display: table-cell;">  <canvas onclick="handlePinInput(' + e + ')" id="pin' + e + '" width="10" height="10"/> </div>');
        }
        return g + "</div>"
    },
    resetPortPins: function(c, b) {
        var d = 8 * c;
	g = '';
        for (i = 0; 8 > i; i++) {
            var e = parseInt(d + i);
            0 < (1 << i & b) && (g += 'setPin("pin' + e + '", "#FF0000");');
        }
        return g
    },
    generateRegisterHtml: function (c) {
        return '<textarea id="register' + c + '" rows="1" cols="4">0x00</textarea>'
    },
    generateFillerHtml: function () {
        return '<div style="display: table-cell;"><canvas width="10" height="10"/></div>'
    },
    generateScreen: function (){
        for(var j =0; j < 128; j++){
            console.log("<tr>");
            for(var i =0; i < 160; i++){
                var id = normalize(i.toString(16));
                id+=normalize(j.toString(16));
                console.log("<td id=\""+id+"\" style=\"background-color: black;\"></td>");
            }
            console.log("</tr>");
        }
    }
}
