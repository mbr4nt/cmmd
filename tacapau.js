var esapi = require("./textilesApi.js"),
    async = require("async");

var queue = async.queue(function(item, callback) {
    //YOUR FUNCTION GOES HERE
    setTimeout(function(){
        console.log(item);
        callback();
    }, 100);
}, 10);

queue.drain = function() {
    console.log("All Done");
};

esapi.getAllCodes(esapi.getAllFabrics, 0, 10, function(err, results) {
    if(err) {
        console.log(err);
        return;
    }
    
    results.forEach(function(item) {
        queue.push(item);
    });
});