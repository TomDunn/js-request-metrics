var _ = require('lodash');

var RequestMetrics = function(options) {
    options = options || {};

    this.baseStartTime = this._now();
    this.latencyPrefix = options.latencyPrefix || "TIME_";
    this.countPrefix   = options.countPrefix   || "COUNT_";

    this.requestData = {};
    this.starts      = {};
    this.ends        = {};
    this.counts      = {};
};

var p =  RequestMetrics.prototype;

p.mark = function(featureName) {
    this.starts[featureName] = this._now();
    return this;
};

p.end = function(featureName) {
    this.ends[featureName] = this._now();
    return this;
};

p.data = function(data) {
    this.requestData = _.extend(this.requestData, data);
    return this;
};

p.count = function(featureName, count) {
    count = count || 1;

    if (!this.counts[featureName]) {
        this.counts[featureName] = 0;
    }

    this.counts[featureName] += count;
    return this;
};

p.getData = function() {
    var data = {};

    _.keys(this.ends).forEach(function(endKey) {
        var endTime     = this.ends[endKey];
        var startTime   = this.starts[endKey];

        if (!startTime) startTime = this.baseStartTime;

        data[this.latencyPrefix + endKey] = endTime - startTime;
    }, this);

    _.keys(this.counts).forEach(function(countKey) {
        data[this.countPrefix + countKey] = this.counts[countKey];
    }, this);

    return _.extend(data, this.requestData);
};

p._now = function() {
    return (new Date()).getTime();
};

module.exports = RequestMetrics;
