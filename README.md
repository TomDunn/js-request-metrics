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

app.use(function(request, response, next)  {
    // here let's say we need to load our user from a db
    request.metrics.mark('loadUser');
    loadUserFromDb(function(err, user) {
        request.user = user;
        request.metrics.end('loadUser');
        request.metrics.data({user: user.username});
        next();
    });
});
```
Now after the request is done console.log would show something like (the numbers are made up):
```
Request summary: {TIME_loadUser: 34, TIME_requestTime: 60, user: someUserName}
```
