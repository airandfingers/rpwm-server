// Require dependencies.
var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , flash = require('connect-flash')

// Define how to format log messages.
  , logger_options = function(tokens, req, res) {
    var status = res.statusCode
      , color = 32;

    if (status >= 500) color = 31
    else if (status >= 400) color = 33
    else if (status >= 300) color = 36;

    return '\033[90m' + req.method
      + ' ' + req.headers.host+ req.originalUrl + ' '
      + '\033[' + color + 'm' + res.statusCode
      + ' \033[90m'
      + (new Date - req._startTime)
      + 'ms\033[0m';

// Define an initial app (middleware shared by all Express apps)
  }, starter_app_generator = function() {
    var app = express();
    app.set('view engine', 'ejs');
    app.use(express.logger(logger_options));
    app.use(express.bodyParser());
    app.configure('development', function() {
      app.set('base_url', 'ayoshitake.dev:' + EXPRESS_PORT);
    });
    app.configure('production', function() {
      app.set('base_url', 'ayoshitake.com');
    });
    return app;
  },

// Declare configuration value(s).
  EXPRESS_PORT = 9000;

require('./modules/db');

var bootstrap_app = starter_app_generator()
  , bootstrap_server = http.createServer(bootstrap_app);

bootstrap_app.set('views', __dirname + '/views');
bootstrap_app.set('show_banner', true);
bootstrap_app.use(express.static(__dirname + '/public'));
bootstrap_app.use(express.cookieParser());
bootstrap_app.use(express.session({ secret: 'M450NRY4TUN3W1N' }));
bootstrap_app.use(passport.initialize());
bootstrap_app.use(passport.session());
bootstrap_app.use(function(req, res, next) {
  res.locals.username = req.user && req.user.username;
  next();
});
bootstrap_app.use(flash());
bootstrap_app.use(bootstrap_app.router);

require('./routes')(bootstrap_app);

//bootstrap_app.use(function(req, res, next) { console.log('request on bootstrap server!'); next(); });
//two vhosts for each domain til i can get regular expression working
//best attempt so far: [a-zA-Z]*\.?ayoshitake.com (matches www.ayoshitake.com but not ayoshitake.com)

//portal
var portal_app = require('./apps/ayoshitake.com/app')(starter_app_generator);
bootstrap_app.use(express.vhost('ayoshitake.*', portal_app));
bootstrap_app.use(express.vhost('www.ayoshitake.*', portal_app));

//wishing well
var wishing_well_app = require('./apps/wishing_well/app')(starter_app_generator);
bootstrap_app.use(express.vhost('wishingwell.ayoshitake.*', wishing_well_app));

//markslist
var markslist_app = require('./apps/markslist/app')(starter_app_generator);
bootstrap_app.use(express.vhost('markslist.ayoshitake.*', markslist_app));

//corridor
var corridor_app = require('./apps/corridor/app')(starter_app_generator);
bootstrap_app.use(express.vhost('corridor.ayoshitake.*', corridor_app));

//minesweeper
var minesweeper_app = require('./apps/minesweeper/app')(starter_app_generator);
bootstrap_app.use(express.vhost('minesweeper.ayoshitake.*', minesweeper_app));

//fortune_cookie
var fortune_cookie_app = require('./apps/fortune_cookie/app')(starter_app_generator);
bootstrap_app.use(express.vhost('fortunecookie.ayoshitake.*', fortune_cookie_app));

//magi-cal.me
var magi_cal_app = require('./apps/magi_cal.me/app')(starter_app_generator);
bootstrap_app.use(express.vhost('magi-cal.*', magi_cal_app));
bootstrap_app.use(express.vhost('w.magi-cal.*', magi_cal_app));
bootstrap_app.use(express.vhost('ww.magi-cal.*', magi_cal_app));
bootstrap_app.use(express.vhost('www.magi-cal.*', magi_cal_app));

//template (just for fun)
var template_app = require('./apps/template/app')(starter_app_generator);
bootstrap_app.use(express.vhost('w.ayoshitake.*', template_app));

//default - portal
bootstrap_app.use(express.vhost('*', portal_app));

//DO NOT ADD MORE VHOSTS AFTER THE ABOVE WILDCARD RULE

//Development-mode-specific middleware configuration
bootstrap_app.configure('development', function() {
  bootstrap_app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

//Production-mode-specific middleware configuration
bootstrap_app.configure('production', function() {
    bootstrap_app.use(express.errorHandler()); 
});

//tell this server to listen on port X.
//thus, this server is accessible at the URL:
//  [hostname]:X
//where [hostname] is the IP address or any of the domains we're hosting
bootstrap_server.listen(EXPRESS_PORT);

//this is printed after the server is up
//console.log("bootstrap server listening on port %d in %s mode", bootstrap_app.address().port, bootstrap_app.settings.env);