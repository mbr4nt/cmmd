var materialApiUrl = "http://esapi.azurewebsites.net/allsteel/details";
var materialApiScene7Url = "{materialApiUrl}/{code}/scene7";
var materialApiRgbUrl = "{materialApiUrl}/{code}/rgb";
var async = require("async");
var fs = require("fs");
var req = require("request");
var interpolate = require("interpolate");
var gm = require('gm');
const desiredResolution = 26;

module.exports = function(code, outputFolder, callback) {
  var urls = [
    interpolate(materialApiScene7Url, {
      code: code,
      materialApiUrl: materialApiUrl
    }),
    interpolate(materialApiRgbUrl, {
      code: code,
      materialApiUrl: materialApiUrl
    })
  ];

  async.map(urls, get, function(err, objects, callback) {
    var scene7 = objects[0];
    var rgb = objects[1];
    var materialInfo = scene7 ? scene7 : {
      rgb: rgb
    };
    materialInfo.code = code;
    materialInfo.outputFolder = outputFolder;
    if (scene7 && scene7.type === "texture") {
      materialInfo.materialType = scene7.type;
      extractResolution(materialInfo, callback);
    }
    else {
      materialInfo.materialType = "color";
      writeJSON(materialInfo, callback);
    }
  });
};

function get(url, callback) {
  req(url, function(err, res) {
    var o = res.body ? JSON.parse(res.body) : null;
    callback(null, o);
  });
}

function extractResolution(materialInfo, callback) {
  if (!/res\=([0-9]+)/.exec(materialInfo.material))
    console.dir(materialInfo);

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
  materialInfo.textureUrl = interpolate("{code}.jpg", materialInfo);
  var outputUrl = interpolate("{outputFolder}/{textureUrl}", materialInfo);
  req(url).pipe(fs.createWriteStream(outputUrl)).on('close', function(err) {
    addScale(materialInfo, callback);
  });
}

function writeJSON(materialInfo, done) {


  var outputInfo = {
    materialType: materialInfo.materialType,
    textureUrl: materialInfo.textureUrl,
    vScale: materialInfo.vScale,
    hScale: materialInfo.hScale,
    rgb: materialInfo.rgb
  };

  fs.writeFile(
    materialInfo.outputFolder + "/" + materialInfo.code + ".json",
    JSON.stringify(outputInfo, null, 4),
    done);
}

function addScale(materialInfo, callback) {
  var outputUrl = interpolate("{outputFolder}/{textureUrl}", materialInfo);
  // obtain the size of an image
  gm(outputUrl).size(function(err, size) {
    materialInfo.vScale = getScale(size.height);
    materialInfo.hScale = getScale(size.width);
    writeJSON(materialInfo, callback);
  });
}

function getScale(pixels) {
  var ppm = desiredResolution * 39.3701;
  return ppm / pixels;
}
