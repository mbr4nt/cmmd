module.exports = new(function(api, async, _) {
    var _maxParallel = 10;

    this.processAllFabrics = function(iterator, callback) {
        processAll(api.getAllFabrics, iterator, callback);
    };

    this.processAllFinishes = function(iterator, callback) {
        processAll(api.getAllFinishes, iterator, callback);
    };

    function processAll(input, iterator, callback) {
        var queue = async.queue(function(item, itemCallback) {
            iterator(item, itemCallback);
        }, _maxParallel);

        queue.drain = function() {
            callback();
        };

        api.getCount(input, function(err, count) {
            if (err) {
                return callback(err);
            }
            api.getAllCodes(input, 0, count, function(err, results) {
                if (err) {
                    return callback(err);
                }

                results.forEach(function(item) {
                    queue.push(item);
                });
            });
        });
    }
})(require("./textilesApi.js"), require("async"), require("underscore"));
