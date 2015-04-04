var should = require('should');
var sinon = require('sinon');
var RequestMetrics = require('../index.js');

describe('RequestMetrics', function() {
    var clock;
    var now = (new Date()).getTime();

    beforeEach(function() {
        clock = sinon.useFakeTimers(now);
    });

    afterEach(function() {
        clock.restore();
    });

    describe('#constructor', function() {
        it('should set default metric type prefixes and start time', function() {
            var metrics = new RequestMetrics();

            (metrics.latencyPrefix).should.be.exactly("TIME_");
            (metrics.countPrefix).should.be.exactly("COUNT_");
            (metrics.baseStartTime).should.be.exactly(now);
        });

        it('should prefer provided prefixes when present', function() {
            var metrics = new RequestMetrics({latencyPrefix: 'lats', countPrefix: 'cs'});

            (metrics.latencyPrefix).should.be.exactly("lats");
            (metrics.countPrefix).should.be.exactly("cs");
        });
    });

    describe('#mark', function() {
        it('should mark a start time for the given feature name', function() {
            var metrics = new RequestMetrics();
            var featureName = 'myFeature';

            (metrics.starts).should.be.empty;

            metrics.mark(featureName);
            (metrics.starts).should.have.property(featureName);
            (metrics.starts[featureName]).should.be.exactly(now);
        });        
    });

    describe('#end', function() {
        it('should mark an end time for the given feature name', function() {
            var metrics = new RequestMetrics();
            var featureName = 'myFeature';

            (metrics.ends).should.be.empty;

            metrics.end(featureName);
            (metrics.ends).should.have.property(featureName);
            (metrics.ends[featureName]).should.be.exactly(now);
        });        
    });

    describe('#count', function() {
        var metrics;
        beforeEach(function() {metrics = new RequestMetrics();});

        it('should by default increment a count by 1', function() {
            metrics.counts.should.be.empty;
            metrics.count('woo');

            metrics.counts.should.have.property('woo');
            metrics.counts.woo.should.be.exactly(1);

            metrics.count('woo');
            metrics.counts.woo.should.be.exactly(2);
        });

        it('should use provided increment', function() {
            metrics.counts.should.be.empty;
            metrics.count('woo', 2);
            metrics.counts.should.have.property('woo');
            metrics.counts.woo.should.be.exactly(2);

            metrics.count('woo', 3);
            metrics.counts.woo.should.be.exactly(5);
        });
    });

    describe('#data', function() {
        var metrics;
        beforeEach(function() {metrics = new RequestMetrics();});

        it('should add given data to metrics', function() {
            metrics.requestData.should.be.empty;
            metrics.data({foo: 'bar'});
            metrics.requestData.should.have.property('foo', 'bar');
        });

        it('should overwrite data for existing key with new data', function() {
            metrics.data({foo: 'bar'});
            metrics.data({foo: 'bat'});
            metrics.requestData.should.have.property('foo', 'bat');
        });
    });

    describe('#getData', function() {
        var metrics;
        beforeEach(function() {metrics = new RequestMetrics();});

        it('should return an object containing request data combined with timings and counts', function() {
            metrics.data({foo: 'bar'});
            metrics.mark('a');
            metrics.end('a');
            metrics.count('b');

            var combined = metrics.getData();
            combined.foo.should.be.exactly('bar');
            combined.TIME_a.should.be.exactly(0); // because time is frozen in test
            combined.COUNT_b.should.be.exactly(1);
        });

        it('should use default start time when there isn\'t one specific for the feature', function() {
            metrics.baseStartTime = now - 1;
            metrics.end('a');

            var data = metrics.getData();
            data.TIME_a.should.be.exactly(1);
        });
    });
});
