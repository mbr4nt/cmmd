var materialApiUrl = "http://esapi.azurewebsites.net/allsteel/details/{code}/scene7";
var fs = require("fs");
var req = require("request");
var interpolate = require("interpolate");
var gm = require('gm');
const desiredResolution = 26;

module.exports = function(code, callback) {
  var url = interpolate(materialApiUrl, { code: code});
  req(url, function(err, res) {
    var materialInfo = JSON.parse(res.body);
    materialInfo.code = code;
    extractResolution(materialInfo, callback);
  });
}

function extractResolution(materialInfo, callback) {
  var res = /res\=([0-9]+)/.exec(materialInfo.material)[1];
  materialInfo.res = res;
  downloadJpg(materialInfo, callback);
}

function downloadJpg(materialInfo, callback) {
  var scale = materialInfo.res / desiredResolution;
  var asset = /is\{(.+)\}/.exec(materialInfo.material)[1];
  var url = interpolate("http://s7d9.scene7.com/is/image/{asset}?scl={scale}", {
    asset: asset,
    scale: scale
  });
  materialInfo.textureUrl = __dirname + interpolate("\\{code}.jpg", materialInfo);
  req(url).pipe(fs.createWriteStream(materialInfo.textureUrl)).on('close', function(err) {
    writeCMClass(materialInfo, callback);
  });
}

function writeCMClass(materialInfo, callback) {

  // obtain the size of an image
  gm(materialInfo.textureUrl).size(function (err, size) {
    console.dir(err);
    materialInfo.vScale = getScale(size.height);
    materialInfo.hScale = getScale(size.width);
    fs.readFile("./materialClass.template", "utf-8", function(err, content) {
      content = interpolate(content, materialInfo);
      console.dir(materialInfo);
      fs.writeFile(materialInfo.code + ".cm", content, function(err) {
        callback();
      });
    });
  });
}

function getScale(pixels) {
  var ppm = desiredResolution * 39.3701;
  return ppm / pixels;
}
