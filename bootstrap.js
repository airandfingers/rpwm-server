// Require dependencies.
var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , flash = require('connect-flash')
  , _ = require('underscore')

// Define how to format log messages
  , colors = {
      WHITE: '\033[37m'
    , GREY: '\033[90m'
    , BLACK: '\033[30m'
    , BLUE: '\033[34m'
    , CYAN: '\033[36m'
    , GREEN: '\033[32m'
    , MAGENTA: '\033[35m'
    , RED: '\033[31m'
    , YELLOW: '\033[33m'
  }
  , log_format = function(tokens, req, res) {
    var message = '';

    // Add HTTP method
    message += colors.WHITE + req.method + ' ';

    // Add host and path
    message += colors.GREY + req.headers.host + colors.WHITE + req.originalUrl + ' ';

    // Add HTTP status code
    var status = res.statusCode
      , color = colors.GREEN;
    if (status >= 500) { color = colors.RED; }
    else if (status >= 400) { color = colors.YELLOW; }
    else if (status >= 300) { color = colors.CYAN; }
    message += color + res.statusCode + ' ';

    // Add route arguments
    var args = req.query;
    if (_.isEmpty(args)) {
      args = req.body;
    }
    if (! _.isEmpty(args)) {
      message += colors.WHITE + JSON.stringify(args) + ' ';
    }

    // Add response time
    message += colors.GREY + (new Date() - req._startTime) + 'ms';

    // Reset color to white
    message += colors.WHITE;

    return message;
  }
// Define a function that generates initial apps with common middlewares
  , starter_app_generator = function(dont_log) {
    var app = express();
    app.set('view engine', 'ejs');
    if (dont_log !== true) { app.use(express.logger(log_format)); }
    app.use(express.json());
    app.use(express.urlencoded());
    app.configure('development', function() {
      app.set('protocol', 'http');
      app.set('base_url', 'ayoshitake.dev:' + EXPRESS_PORT);
    });
    app.configure('production', function() {
      app.set('protocol', 'http');
      app.set('base_url', 'ayoshitake.com');
    });
    return app;
  }
// Connect to the database
  , db = require('./modules/db')
// Declare configuration value(s)
  , EXPRESS_PORT = process.env.PORT || 9000
// Define some session-related settings
  , session_settings = {
      store: db.session_store
    , secret: db.SESSION_SECRET
    , sid_name: 'express.sid'
    , cookie: {
      maxAge: 3600000 // 1 hour
    //, secure: true // Only communicate via HTTPS
    }
  }

  , bootstrap_app = module.exports = starter_app_generator(true)
  , bootstrap_server = http.createServer(bootstrap_app);

// Set some configuration values
bootstrap_app.set('views', __dirname + '/views');
bootstrap_app.set('show_banner', true);
// Attempt to redirect requests made with HTTPS to HTTP version (not working)
bootstrap_app.use(function(req, res, next) {
  if (req.headers['x-forwarded-proto'] === 'https') {
    var url = 'http://' + req.headers.host + req.originalUrl;
    res.writeHead(301, { location: url });
    return res.end('Redirecting to <a href="' + url + '">' + url + '</a>.');
  }
  else {
    //console.log('headers[x-forwarded-proto] is', req.headers['x-forwarded-proto'], ', so not redirecting');
    return next();
  }
});
bootstrap_app.use(express.static(__dirname + '/public')); // Serve files found in the public directory
bootstrap_app.use(express.cookieParser()); // Parse cookie into req.cookies
bootstrap_app.use(express.session({ // Store and retrieve sessions, using a session store and cookie
  store: session_settings.store // Where sessions are stored to and loaded from
, secret: session_settings.secret // Secret used to sign cookies, to prevent tampering
, key: session_settings.sid_name // The name under which the session ID will be stored
, cookie: session_settings.cookie // Settings for cookies
}));
bootstrap_app.use(passport.initialize()); // Initialize Passport authentication module
bootstrap_app.use(passport.session()); // Set up Passport session
bootstrap_app.use(function(req, res, next) {
  // Set some res.locals values for use in header
  if (req.method === 'GET') {
    // Get username from req.user
    res.locals.username = req.user && req.user.username;
  }
  next();
});
bootstrap_app.use(flash()); // Necessary to display Passport "flash" messages

bootstrap_app.use(bootstrap_app.router); // Match against routes in routes.js

// export some variables to be used by other files (so far, app for routes)
module.exports = {
  app: bootstrap_app
};

// Define routes that bootstrap_app responds to
require('./routes');

// Best attempt at regex so far: [a-zA-Z]*\.?ayoshitake.com (matches www.ayoshitake.com but not ayoshitake.com)

// Portal - links to other apps; "about" and "contact" pages
var portal_app = require('./apps/ayoshitake.com/app')(starter_app_generator);
bootstrap_app.use(express.vhost('ayoshitake.*', portal_app));
bootstrap_app.use(express.vhost('www.ayoshitake.*', portal_app));

// Wishing Well - stores and shows wishes
var wishing_well_app = require('./apps/wishing_well/app')(starter_app_generator);
bootstrap_app.use(express.vhost('wishingwell.ayoshitake.*', wishing_well_app));

// Mark's List - serves static files out of a "share" directory
var markslist_app = require('./apps/markslist/app')(starter_app_generator);
bootstrap_app.use(express.vhost('markslist.ayoshitake.*', markslist_app));

// Corridor - 2-player clone of Quoridor (no concept of players yet)
var corridor_app = require('./apps/corridor/app')(starter_app_generator);
bootstrap_app.use(express.vhost('corridor.ayoshitake.*', corridor_app));

// Minesweeper - 1-player clone of Minesweeper
var minesweeper_app = require('./apps/minesweeper/app')(starter_app_generator);
bootstrap_app.use(express.vhost('minesweeper.ayoshitake.*', minesweeper_app));

// Fortune Cookie - stores, shows, and manages fortunes
var fortune_cookie_app = require('./apps/fortune_cookie/app')(starter_app_generator);
bootstrap_app.use(express.vhost('fortunecookie.ayoshitake.*', fortune_cookie_app));

// magi-cal.me - brochure site for a magician
var magi_cal_app = require('./apps/magi_cal.me/app')(starter_app_generator);
bootstrap_app.use(express.vhost('magi-cal.*', magi_cal_app));
bootstrap_app.use(express.vhost('w.magi-cal.*', magi_cal_app));
bootstrap_app.use(express.vhost('ww.magi-cal.*', magi_cal_app));
bootstrap_app.use(express.vhost('www.magi-cal.*', magi_cal_app));

// rock paper scissors
var rps_app = require('./apps/rps/app')(starter_app_generator);
bootstrap_app.use(express.vhost('rps.ayoshitake.*', rps_app));

//ETS tutoring
var ets_app = require('./apps/ets_tutoring/app')(starter_app_generator);
bootstrap_app.use(express.vhost('etstutoring.ayoshitake.*', ets_app));
var ets_app_2 = require('./apps/ets_tutoring_2/app')(starter_app_generator);
bootstrap_app.use(express.vhost('etstutoring2.ayoshitake.*', ets_app_2));

//text editor
var text_app = require('./apps/text/app')(starter_app_generator);
bootstrap_app.use(express.vhost('text.ayoshitake.*', text_app));

//troll's goals
var text_app = require('./apps/trolls_goals/app')(starter_app_generator);
bootstrap_app.use(express.vhost('trollsgoals.ayoshitake.*', text_app));

//template (just for fun)
var template_app = require('./apps/template/app')(starter_app_generator);
bootstrap_app.use(express.vhost('w.ayoshitake.*', template_app));

//default - portal
bootstrap_app.use(express.vhost('*', portal_app));

// DO NOT ADD MORE VHOSTS AFTER THE ABOVE WILDCARD RULE

// Development-only configuration (based on NODE_ENV)
bootstrap_app.configure('development', function() {
  // Display "noisy" errors - show exceptions and stack traces
  bootstrap_app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

// Production-only configuration (based on NODE_ENV)
bootstrap_app.configure('production', function() {
  // Display "quiet" errors - just HTTP response code 500
  bootstrap_app.use(function(req, res) {
    res.status(500);
    res.end();
  });
});

// Tell this server to listen on EXPRESS_PORT.
// After this, the server is accessible at [domain/hostname/IP]:EXPRESS_PORT
bootstrap_server.listen(EXPRESS_PORT);

// This is printed after the server is up
console.log('bootstrap server listening on port %d in %s mode',
            bootstrap_server.address().port, bootstrap_app.settings.env);