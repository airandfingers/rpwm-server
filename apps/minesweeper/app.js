module.exports = function(starter_app_generator) {
  var express = require('express'), // our web framework
      http = require('http'), // Node's built-in HTTP module
      app = starter_app_generator(), // our express app
      server = http.createServer(app), // the web server itself
      _ = require('underscore');

  _.str = require('underscore.string');
  //Mix non-conflict _.str functions into _'s namespace
  _.mixin(_.str.exports());

  //Middleware Configuration
  app.configure(function() {
    app.set('site_name', 'minesweeper');
    app.set('views', __dirname + '/views');
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'M450NRY4TUN3W1N' }));
    app.use(express.methodOverride());
  });

  //Development-mode-specific middleware configuration
  app.configure('development', function() {
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);    
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  //Production-mode-specific middleware configuration
  app.configure('production', function() {
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(app.router);
    app.use(express.errorHandler());
  });

  require('./routes')(app);

  return server;
};