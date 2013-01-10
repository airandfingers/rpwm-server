module.exports = function(starter_app_generator) {
  var express = require('express'), // our web framework
      http = require('http'), // Node's built-in HTTP module
      app = starter_app_generator(), // our express app
      server = http.createServer(app), // the web server itself
      passport = require('passport'),
      flash = require('connect-flash'),
      ecstatic = require('ecstatic'),
      auth = require('./auth');

  //Middleware Configuration
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'M450NRY4TUN3W1N' }));
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
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
  
  require('./routes')(app, auth);

  return server;
};