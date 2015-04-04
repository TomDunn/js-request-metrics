# Request Metrics
A simple utility intended to help time interactions, count events

## Installation
TODO: package needs imported into npm

## Example usage in express

```javascript
var RequestMetrics = require('request-metrics');
// ... initialize your express app

app.use(function(request, response, next) {
    request.metrics = new RequestMetrics();
    
    var afterRequest = function() {
        response.removeListener('finish', afterRequest);
        response.removeListener('after',  afterRequest);
        
        request.metrics.end("requestTime");
        console.log("Request summary: ", request.metrics.getData());
    };

    response.on('finish', afterRequest);
    response.on('after',  afterRequest);
});
```
