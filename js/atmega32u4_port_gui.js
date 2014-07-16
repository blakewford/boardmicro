    var tools = require('./ui');
    console.log("<br/>");
    console.log("<div style=\"width: 160px; display: table; border-spacing: 7px;\">");
    console.log(tools.generatePortHtml(0, 0xFF));
    console.log(tools.generatePortHtml(1, 0xC0));
    console.log(tools.generatePortHtml(2, 0xFF));
    console.log(tools.generatePortHtml(3, 0x44));
    console.log(tools.generatePortHtml(4, 0xF3));
    console.log("</div>");
