module.exports = new(function(req, interpolate, _) {
    var tfApiUrl = "http://esapi.azurewebsites.net/",
        colorsUrl = "allsteel/fabricColor/search?k=&skip={skip}&take{take}",
        self = this;

    this.getAllFabrics = function(skip, take, callback) {
        //defaults
        skip = skip || 0;
        take = take || 100;

        var url = tfApiUrl + interpolate(colorsUrl, {
            skip: skip,
            take: take
        });

        req(url, function(err, res) {
            if (err) {
                return callback(err);
            }

            var results = JSON.parse(res.body);
            callback(null, results);
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
})(require("request"), require("interpolate"), require("underscore"));