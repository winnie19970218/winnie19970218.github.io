$(document).ready(function () {
  var config = {
    apiKey: "AIzaSyBUImK1HGCS_I-fhSB3ddlFAeqG0A7qGvg",
    authDomain: "decode-166dc.firebaseapp.com",
    databaseURL: "https://decode-166dc.firebaseio.com",
    projectId: "decode-166dc",
    storageBucket: "decode-166dc.appspot.com",
    messagingSenderId: "383506485729",
    appId: "1:383506485729:web:5611ae7dc9907891e482a0",
    measurementId: "G-1X4P6ZK0PJ"
  };
  firebase.initializeApp(config);
  firebase.analytics();

  var db = firebase.firestore();

  // Get a reference to the storage service, which is used to create references in your storage bucket
  var storage = firebase.storage();

  // Create a storage reference from our storage service
  var storageRef = storage.ref();

  function listname() {

    //clear the page
    $("#data").empty();

    // Get user name
    var databasename = "decode-166dc";




    var name = firebase.database().ref("/");

    //Map < dynamic, dynamic > map = snapshot.val();
    //map = new Map(snapshot.val());
    //map.forEach(function (key, value) {
    // print('$key: $value');
    //});

    //console.log(snapshot.name());
    name.once("value", function (snapshot) {

      var list = getParent(snapshot);
      console.log(list);
      $("#data").append("name:\n");
      $("#data").append(list + "\n");
    });

  }

  function getdata() {

    //clear the page
    $("#data").empty();

    // Get user name
    var username = document.getElementById("username").value;

    // Get date
    /*var timeRef = firebase.database().ref(username + "/date");
    timeRef.once("value", function (snapshot) {
      var date = snapshot.val();
      $("#data").append("Date: " + date + "\n");
    });*/

    // Get bit data  
    var docRef = firebase.database().ref(username + "/decode");
    docRef.once('value', function (snapshot) {
      var data = snapshot.val();
      console.log(data);
      $("#data").append(data);
    });

    // Get bit picture
    var imagesRef = storageRef.child(username + '/scan.jpg');
    imagesRef.getDownloadURL().then(function (url) {
      // `url` is the download URL for 'images/stars.jpg'

      // Or inserted into an <img> element:
      $("#pic").attr("src", url);
      var img = document.getElementById('pic');
      img.style.left = "-300px";
    }).catch(function (error) {
      // Handle any errors
      switch (error.code) {
        case 'storage/object-not-found':
          // File doesn't exist
          alert("使用者名稱不存在或錯誤,請重新輸入");
          break;
      }
    });
  }

  function downloaddata(id) {

    var content = $(id).text();
    // any kind of extension (.txt,.cpp,.cs,.bat)
    var filename = "download.txt";

    var blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });

    saveAs(blob, filename);
  }

  function downloadphoto() {

    var username = document.getElementById("username").value;
    var imagesRef = storageRef.child(username + '/scan.jpg');
    imagesRef.getDownloadURL().then(function (url) {
      // `url` is the download URL for 'images/stars.jpg'
      // This can be downloaded directly:
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function (event) {
        var blob = xhr.response;
      };
      xhr.open('GET', url);

      let image = new Image();
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
      image.onload = () => {
        let canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        let ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, image.width, image.height)
        canvas.toBlob((blob) => {
          let url = URL.createObjectURL(blob)
          aDownload(url)
          // 用完釋放URL對象
          URL.revokeObjectURL(url)
        })
      }
    }).catch(function (error) { });
  }

  function svgDataURL(svg) {
    var svgAsXML = (new XMLSerializer).serializeToString(svg);
    return "data:image/svg+xml," + encodeURIComponent(svgAsXML);
  }

  function aDownload(href) {
    let eleLink = document.createElement('a')
    eleLink.download = "scan"
    eleLink.href = href
    eleLink.click()
    eleLink.remove()
  }

  function Qrgenerations() {
    $("#qrcode").html("");
    var input = "https://www.yzu.edu.tw/index.php/tw/";
    console.log(input);
    const codeWriter = new ZXing.BrowserQRCodeSvgWriter();
    // you can get a SVG element.
    //const svgElement = codeWriter.write(input, 300, 300);
    // or render it directly to DOM.
    codeWriter.writeToDom('#qrcode', input, 300, 300);
  }

  function svgTopng(link) {
    var svg = link;
    var svgData = new XMLSerializer().serializeToString(svg);

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    var img = document.createElement("img");
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));

    img.onload = function () {
      ctx.drawImage(img, 0, 0);

      // Now is done
      console.log(canvas.toDataURL("image/png"));
    };
    return canvas.toDataURL("image/png");
  }

  function compare() {
    var formfirebase = document.getElementById("data").innerHTML;
    var formgenerator = document.getElementById("data_from_generate").innerHTML;

    //var len = formfirebase.length - formfirebase.count(' ');
    var count = 0;
    for (var i = 0; i < formfirebase.length; i++)
      if (formfirebase[i] == formgenerator[i])
        count++

    console.log(formfirebase.length);
    console.log(formgenerator.length);
    console.log(count);
    console.log();

    $("#compare_result").append(count / formfirebase.length);
  }

  $("#getbit").click(function () {
    getdata();
  });
  $("#download_bit").click(function () {
    downloaddata("#data");
  });
  $("#download_pic").click(function () {
    $("#compare_result").empty();
    compare()
    //downloadphoto();
  });
  $("#bit_from_generator").click(function () {
    downloaddata("#data_from_generate");
  });
  $("#getQR").click(function () {
    var svg = document.querySelector("#qrcode-svg");
    /*//var svgString = new XMLSerializer().serializeToString(document.querySelector('qrcode-canvas'));

    var DOMURL = self.URL || self.webkitURL || self;
    var qr = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(qr);*/

    //aDownload(svgTopng(svg));
    aDownload(svgTopng(svg));
  });
});