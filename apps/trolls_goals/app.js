module.exports = function(starter_app_generator) {
  var express = require('express'), // our web framework
      http = require('http'), // Node's built-in HTTP module
      app = starter_app_generator(), // our express app
      server = http.createServer(app), // the web server itself
      auth = require('../../modules/auth');

  //Middleware Configuration
  app.configure(function() {
    app.set('site_name', 'troll`s goals');
    app.set('include_scripts', false);
    app.set('views', __dirname + '/views');
    app.use(express.methodOverride());
  });

  //Development-mode-specific middleware configuration
  app.configure('development', function() {
    app.use(express.static(__dirname + '/public'));
    app.use(function(req, res, next) {
      res.error = function(error) {
        console.error(error);
        console.trace();
        error = error.message || error;
        res.status(500);
        res.json({ error: error });
      };
      next();
    });
    app.use(auth.ensureAuthenticated);
    app.use(app.router);
    // Display "noisy" errors - show exceptions and stack traces
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });

  //Production-mode-specific middleware configuration
  app.configure('production', function() {
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(function(req, res, next) {
      res.error = function(error) {
        console.error(error);
        console.trace();
        res.status(500);
        res.json({ error: 'Sorry, an error occurred. We\'ll look into it.' });
      };
      next();
    });
    app.use(auth.ensureAuthenticated);
    app.use(app.router);
    // Display "quiet" errors - just HTTP response code 500
    app.use(function(req, res) {
      res.status(500);
      res.end();
    });
  });
  
  require('./routes')(app);

  return server;
};