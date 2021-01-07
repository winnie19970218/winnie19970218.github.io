/*
 * QR Code generator input demo (TypeScript)
 *
 * Copyright (c) Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */
"use strict";
document.addEventListener("DOMContentLoaded", (event) => {

    var input = document.querySelector('#secret-input');
    input.addEventListener('keyup', function (event) {
      /*if (event.which == 48) {
        console.log(event.which);
       
      }else{
        return false;
      }*/

      var invalidChars = /[^0-1]/gi
      if(invalidChars.test(input.value)) {
        input.value = input.value.replace(invalidChars,"");
      }
  
  
    });

    document.getElementById('encodeButton').addEventListener('click', () => {
       
		/*const inputVector = document.getElementById('secret-input').value.split('').map(x => parseInt(x));
		if (inputVector.length !== 5) {
			alert('The current implementation only support 15/5 golay codes!');
			return;
		}
        const encodedRes = GolayCode.encode(inputVector);
        console.log(encodedRes);
        document.getElementById('encodedVector').value = encodedRes.join(', ');*/
        
        
    });
    
    document.getElementById('generateButton').addEventListener('click', () => {
        const inputPieces = parseInt(document.getElementById('pieces-input').value);

        function paddingLeft(str,lenght){
            if(str.length >= lenght)
            return str;
            else
            return paddingLeft("0" +str,lenght);
        }
        var result32 = new Array();
        var result64 = new Array();
        function ecc32(limit){
            var rem; //data 0~31
            for (var j=0; j<limit; j++){
                rem = j;
                for (var i = 0; i < 10; i++)
                    rem = (rem << 1) ^ ((rem >>> 9) * 0x537); //0x537 = 1,01001,10111 irreducible polynomial, now rem=ecc
                var bits = (j << 10 | rem) //bits = data(5bits)+ecc(10bits)
                if (bits >>> 15 != 0)
                    throw "Assertion error";
                result32[j] = bits.toString(2);
            }
            
            for (var k=0; k<limit; k++){
                result32[k] = paddingLeft( result32[k] , 15 );
            }
        }

        function ecc64(limit){  
            var rem; //data 0~63
            for (var j=0; j<limit; j++){
                rem = j;
                for (var i = 0; i < 12; i++)
                    rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25); //0x1F25 = 111,11001,00101 irreducible polynomial, now rem=ecc
                var bits = (j << 12 | rem) //bits = data(6bits)+ecc(12bits)
                if (bits >>> 18 != 0)
                    throw "Assertion error";
                result64[j] = bits.toString(2);
            }
           
            for (var k=0; k<limit; k++){
                result64[k] = paddingLeft( result64[k] , 18 );
            }
        }
     
        if (inputPieces<=32){
            ecc32(inputPieces);
            console.log(result32);
        }else if(32<inputPieces<=64){
            ecc64(inputPieces);
            console.log(result64);
        }
        
        
        

        /*for (var i=0; i<inputPieces; i++){
            console.log(i);
            var sttr = "<canvas id=\"qrcode-canvas" + i +" \"   style=\"padding:0.5em; background-color:#E8E8E8; display:none;\"></canvas>"
            $(sttr).appendTo("#QRimg");
            $("<svg id=\"qrcode-svg" + i +" \" style=\"width:30em; height:30em; padding:1em; background-color:#E8E8E8;\"><rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\" stroke-width=\"0\"></rect><path d=\"\" fill=\"#000000\" stroke-width=\"0\"></path></svg>").appendTo("#QRimg");

        }*/
    });
});
var app;
(function (app) {
    function initialize() {
        getElem("loading").style.display = "none";
        getElem("loaded").style.removeProperty("display");
        var elems = document.querySelectorAll("input[type=number], textarea");
        for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
            var el = elems_1[_i];
            if (el.id.indexOf("version-") != 0)
                el.oninput = redrawQrCode;
        }
        elems = document.querySelectorAll("input[type=radio], input[type=checkbox]");
        for (var _a = 0, elems_2 = elems; _a < elems_2.length; _a++) {
            var el = elems_2[_a];
            el.onchange = redrawQrCode;
        }
        redrawQrCode();
    }
    function redrawQrCode() {
        // Show/hide rows based on bitmap/vector image output
        var bitmapOutput = getInput("output-format-bitmap").checked;
        var scaleRow = getElem("scale-row");
        var svgXmlRow = getElem("svg-xml-row");
        if (bitmapOutput) {
            scaleRow.style.removeProperty("display");
            svgXmlRow.style.display = "none";
        }
        else {
            scaleRow.style.display = "none";
            svgXmlRow.style.removeProperty("display");
        }
        var svgXml = getElem("svg-xml-output");
        svgXml.value = "";
        // Reset output images in case of early termination
        var num = parseInt(getInput("pieces-input").value, 10);
        //var canvas = getElem("qrcode-canvas");
        var canvas = new Array(num);
        var svg = new Array(num);

        //----------------------------------------------------------------------------------------------------------------------------------
        var loadsuccessful = new Promise((resolve, reject) => {
            var flag = 2;
            $("#QRimg").empty();
            $("#QRimg").append("<table id=\"qrcode-table\"></table>");
            for (var i=1;i<=32;i++){
                $("#qrcode-table").append("<tr id=\"qrcode-row"+i+"\"></tr>");
            }
            
            for (var i = 0; i < num; i++) {
                //console.log(num);
                //console.log(i);
             
                if(i%4==0 && i!=0){
                    flag+=2;
                    $("#qrcode-row"+(flag-1)).append("<td align=\"center\">"+(i+1)+"</td>");
                    $("#qrcode-row"+flag).append("<td><canvas id=\"qrcode-canvas" + i + "\"   style=\"padding:0.5em; background-color:#E8E8E8;\"></canvas><svg id=\"qrcode-svg" + i + "\" style=\"width:30em; height:30em; padding:1em; background-color:#E8E8E8;\"><rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\" stroke-width=\"0\"></rect><path d=\"\" fill=\"#000000\" stroke-width=\"0\"></path></svg></td>");
                    
                }else{
                    $("#qrcode-row"+(flag-1)).append("<td align=\"center\">"+(i+1)+"</td>");
                    $("#qrcode-row"+flag).append("<td><canvas id=\"qrcode-canvas" + i + "\"   style=\"padding:0.5em; background-color:#E8E8E8;\"></canvas><svg id=\"qrcode-svg" + i + "\" style=\"width:30em; height:30em; padding:1em; background-color:#E8E8E8;\"><rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\" stroke-width=\"0\"></rect><path d=\"\" fill=\"#000000\" stroke-width=\"0\"></path></svg></td>");
               
                }
                //$("#qrcode-table td").append("<svg id=\"qrcode-svg" + i + "\" style=\"width:30em; height:30em; padding:1em; background-color:#E8E8E8;\"><rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\" stroke-width=\"0\"></rect><path d=\"\" fill=\"#000000\" stroke-width=\"0\"></path></svg>");
                
            }
            setTimeout(function () {
                resolve('finish');
            }, 1000);
        })

        loadsuccessful.then(function (value) {
        });

        // Returns a QrCode.Ecc object based on the radio buttons in the HTML form.
        function getInputErrorCorrectionLevel() {
            if (getInput("errcorlvl-medium").checked)
                return qrcodegen.QrCode.Ecc.MEDIUM;
            else if (getInput("errcorlvl-quartile").checked)
                return qrcodegen.QrCode.Ecc.QUARTILE;
            else if (getInput("errcorlvl-high").checked)
                return qrcodegen.QrCode.Ecc.HIGH;
            else // In case no radio button is depressed
                return qrcodegen.QrCode.Ecc.LOW;
        }
        // Get form inputs and compute QR Code
        var ecl = getInputErrorCorrectionLevel();
        var text = getElem("text-input").value;
        var secret = getElem("secret-input").value;
        var secretary = new Array();
        secretary = secret.split("");
        
        
       
       
        var segs = qrcodegen.QrSegment.makeSegments(text);
        var secretsegs = qrcodegen.QrSegment.makeSegments(secret);
        
        try{
            //console.log(segs);
            var secretsegsary = secretsegs[0].bitData
            
            //console.log(secretsegsary)
        }catch(error){

        }
       

        var minVer = parseInt(getInput("version-min-input").value, 10);
        var maxVer = parseInt(getInput("version-max-input").value, 10);
        var mask = parseInt(getInput("mask-input").value, 10);
        var boostEcc = getInput("boost-ecc-input").checked;
        var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);
        //----------winnie ecc
        const inputPieces = parseInt(document.getElementById('pieces-input').value);
        var result = new Array();
        result = ecc64(inputPieces);
        console.log(result);
        /*if (inputPieces<=32){
            result = ecc32(inputPieces);
            console.log(result);
        }else if(32<inputPieces<=64){
            result = ecc64(inputPieces);
            console.log(result);
        }*/
        //----------winnie ecc
        // Draw   output
        var border = parseInt(getInput("border-input").value, 10);
        var mode = getInputModeLevel();
        if (border < 0 || border > 100)
            return;
        if (bitmapOutput) {
            var scale = parseInt(getInput("scale-input").value, 10);
            if (scale <= 0 || scale > 30)
                return;
            for (var i = 0; i < num; i++) {
                var canvasA = getElem("qrcode-canvas" + i);
                canvasA.style.display = "none";
                var svgA = document.getElementById("qrcode-svg" + i);
                svgA.style.display = "none";
                qr.drawCanvas(scale, border, canvasA, mode, result[i]);//secret
                canvasA.style.removeProperty("display");
            }
        }
        else {
            var code = qr.toSvgString(border);
            var viewBox = / viewBox="([^"]*)"/.exec(code)[1];
            var pathD = / d="([^"]*)"/.exec(code)[1];
            svg[0].setAttribute("viewBox", viewBox);
            svg[0].querySelector("path").setAttribute("d", pathD);
            svg[0].style.removeProperty("display");
            svgXml.value = qr.toSvgString(border);
        }

        //----------winnie ecc function
        function paddingLeft(str,lenght){
            if(str.length >= lenght)
            return str;
            else
            return paddingLeft("0" +str,lenght);
        }
        function ecc32(limit){
            var result = new Array();
            var rem; //data 0~31
            for (var j=0; j<limit; j++){
                rem = j;
                for (var i = 0; i < 10; i++)
                    rem = (rem << 1) ^ ((rem >>> 9) * 0x537); //0x537 = 1,01001,10111 irreducible polynomial, now rem=ecc
                var bits = (j << 10 | rem) //bits = data(5bits)+ecc(10bits)
                if (bits >>> 15 != 0)
                    throw "Assertion error";
                result[j] = bits.toString(2);
            }
            
            for (var k=0; k<limit; k++){
                result[k] = paddingLeft( result[k] , 15 );
            }
            return result;
        }
        function ecc64(limit){
            var result = new Array();  
            var rem; //data 0~63
            for (var j=0; j<limit; j++){
                rem = j;
                for (var i = 0; i < 12; i++)
                    rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25); //0x1F25 = 111,11001,00101 irreducible polynomial, now rem=ecc
                var bits = (j << 12 | rem) //bits = data(6bits)+ecc(12bits)
                if (bits >>> 18 != 0)
                    throw "Assertion error";
                result[j] = bits.toString(2);
            }
           
            for (var k=0; k<limit; k++){
                result[k] = paddingLeft( result[k] , 18 );
            }
            return result;
        }
        //----------winnie ecc function

        //----------winnie mode function
        
        function getInputModeLevel() {
            if (getInput("mode-lvl").checked)
                return 0;
            else if (getInput("mode-lv2").checked)
                return 1;
            else if (getInput("mode-lv3").checked)
                return 2;
            else if (getInput("mode-lv4").checked)
                return 3;    
            else // In case no radio button is depressed
                console.log("error");
        }

        //----------winnie mode function

        // Returns a string to describe the given list of segments.
        function describeSegments(segs) {
            if (segs.length == 0)
                return "none";
            else if (segs.length == 1) {
                var mode = segs[0].mode;
                var Mode = qrcodegen.QrSegment.Mode;
                if (mode == Mode.NUMERIC)
                    return "numeric";
                if (mode == Mode.ALPHANUMERIC)
                    return "alphanumeric";
                if (mode == Mode.BYTE)
                    return "byte";
                if (mode == Mode.KANJI)
                    return "kanji";
                return "unknown";
            }
            else
                return "multiple";
        }
        // Returns the number of Unicode code points in the given UTF-16 string.
        function countUnicodeChars(str) {
            var result = 0;
            for (var i = 0; i < str.length; i++, result++) {
                var c = str.charCodeAt(i);
                if (c < 0xD800 || c >= 0xE000)
                    continue;
                else if (0xD800 <= c && c < 0xDC00 && i + 1 < str.length) { // High surrogate
                    i++;
                    var d = str.charCodeAt(i);
                    if (0xDC00 <= d && d < 0xE000) // Low surrogate
                        continue;
                }
                throw "Invalid UTF-16 string";
            }
            return result;
        }
        // Show the QR Code symbol's statistics as a string
        getElem("statistics-output").textContent = "QR Code version = " + qr.version + ", " +
            ("mask pattern = " + qr.mask + ", ") +
            ("character count = " + countUnicodeChars(text) + ",\n") +
            ("encoding mode = " + describeSegments(segs) + ", ") +
            ("error correction = level " + "LMQH".charAt(qr.errorCorrectionLevel.ordinal) + ", ") +
            ("data bits = " + qrcodegen.QrSegment.getTotalBits(segs, qr.version) + ".");
    }
    function handleVersionMinMax(which) {
        var minElem = getInput("version-min-input");
        var maxElem = getInput("version-max-input");
        var minVal = parseInt(minElem.value, 10);
        var maxVal = parseInt(maxElem.value, 10);
        minVal = Math.max(Math.min(minVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
        maxVal = Math.max(Math.min(maxVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
        if (which == "min" && minVal > maxVal)
            maxVal = minVal;
        else if (which == "max" && maxVal < minVal)
            minVal = maxVal;
        minElem.value = minVal.toString();
        maxElem.value = maxVal.toString();
        redrawQrCode();
    }
    app.handleVersionMinMax = handleVersionMinMax;
    function getElem(id) {
        var result = document.getElementById(id);
        if (result instanceof HTMLElement)
            return result;
        throw "Assertion error";
    }
    function getInput(id) {
        var result = getElem(id);
        if (result instanceof HTMLInputElement)
            return result;
        throw "Assertion error";
    }
    initialize();
})(app || (app = {}));
