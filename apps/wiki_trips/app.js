module.exports = function(starter_app_generator) {
  var express = require('express'), // our web framework
      http = require('http'), // Node's built-in HTTP module
      app = starter_app_generator(), // our express app
      server = http.createServer(app); // the web server itself

  //Middleware Configuration
  app.configure(function() {
    app.set('site_name', 'wiki trips');
    app.set('views', __dirname + '/views');
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
  });

  //Development-mode-specific middleware configuration
  app.configure('development', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  //Production-mode-specific middleware configuration
  app.configure('production', function() {
    app.use(express.errorHandler());
  });
  
  require('./routes')(app);

  return server;
};