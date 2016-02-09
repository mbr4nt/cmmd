var fabrics = require("./processTextiles.js"),
    downloadMaterial = require("./index.js");

fabrics.processAllFabrics(function(code, callback) {
    console.log(code);
    downloadMaterial(code, "./output", function(err) {
        callback(err);
    });
}, function(err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log("All done");
});