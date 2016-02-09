module.exports = new(function(api, async, _) {
    var _maxParallel = 10;

    this.processAllFabrics = function(iterator, callback) {
        var queue = async.queue(function(item, itemCallback) {
            iterator(item, itemCallback);
        }, _maxParallel);

        queue.drain = function() {
            callback();
        };

        api.getCount(api.getAllFabrics, function(err, count) {
            if (err) {
                return callback(err);
            }

            api.getAllCodes(api.getAllFabrics, 0, count, function(err, results) {
                if (err) {
                    return callback(err);
                }

                results.forEach(function(item) {
                    queue.push(item);
                });
            });
        });
    };
})(require("./textilesApi.js"), require("async"), require("underscore"));