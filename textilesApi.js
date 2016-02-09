module.exports = new(function(req, interpolate, _) {
    var tfApiUrl = "http://esapi.azurewebsites.net/",
        fabricsUrl = "allsteel/fabricColor/search?k=&skip={skip}&take={take}",
        finishesUrl = "allsteel/fabricColor/search?k=&skip={skip}&take={take}";

    this.getAllFinishes = function(skip, take, callback) {
        _getAll(finishesUrl, skip, take, callback);
    };

    this.getAllFabrics = function(skip, take, callback) {
       _getAll(fabricsUrl, skip, take, callback);
    };

    this.getCount = function(input, callback) {
        input(0, 0, function(err, results) {
            if (err) {
                return callback(err);
            }

            callback(null, results.matchCount);
        });
    };

    this.getAllCodes = function(input, skip, take, callback) {
        input(skip, take, function(err, results) {
            if (err) {
                return callback(err);
            }

            results = _.map(results.items, function(item) {
                return item.code;
            });

            callback(null, results);
        });
    };

    function _getAll(partUrl, skip, take, callback) {
        //defaults
        skip = skip || 0;
        take = take || 100;

        var url = tfApiUrl + interpolate(partUrl, {
            skip: skip,
            take: 10
        });

        req(url, function(err, res) {
            if (err) {
                return callback(err);
            }

            var results = JSON.parse(res.body);
            callback(null, results);
        });
    }
})(require("request"), require("interpolate"), require("underscore"));