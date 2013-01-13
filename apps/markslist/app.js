module.exports = function(starter_app_generator) {
  var express = require('express'), // our web framework
      http = require('http'), // Node's built-in HTTP module
      app = starter_app_generator(), // our express app
      server = http.createServer(app), // the web server itself
      auth = require('../../modules/auth'),
      ecstatic = require('ecstatic');

  //Middleware Configuration
  app.configure(function() {
    //app.use(express.methodOverride());
    //app.use(express.static(__dirname + '/public'));
    app.use(auth.ensureAuthenticated);
    app.use(ecstatic(__dirname + '/share'));
  });

  //Development-mode-specific middleware configuration
  app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });

  //Production-mode-specific middleware configuration
  app.configure('production', function() {
      app.use(express.errorHandler()); 
  });

  return server;
};