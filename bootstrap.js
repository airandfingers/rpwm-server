// Module dependencies.
//here we import other modules
//and store local references to them
var express = require('express')
  , http = require('http')

  , bootstrap_app = express()
  , bootstrap_server = http.createServer(bootstrap_app)
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
  }, starter_app_generator = function() {
    var app = express();
    app.set('view engine', 'ejs');
    app.use(express.logger(logger_options));
    app.use(express.bodyParser());
    return app;
  };

//bootstrap_app.use(function(req, res, next) { console.log('request on bootstrap server!'); next(); });
//two vhosts for each domain til i can get regular expression working
//best attempt so far: [a-zA-Z]*\.?ayoshitake.com (matches www.ayoshitake.com but not ayoshitake.com)

//portal
bootstrap_app.use(express.vhost('ayoshitake.com', require('./apps/ayoshitake.com/app')(starter_app_generator)));
bootstrap_app.use(express.vhost('www.ayoshitake.com', require('./apps/ayoshitake.com/app')(starter_app_generator)));

//wishing well
bootstrap_app.use(express.vhost('wishingwell.ayoshitake.com', require('./apps/wishing_well/app')(starter_app_generator)));

//markslist
bootstrap_app.use(express.vhost('markslist.ayoshitake.com', require('./apps/markslist/app')(starter_app_generator)));

//corridor
bootstrap_app.use(express.vhost('corridor.ayoshitake.com', require('./apps/corridor/app')(starter_app_generator)));

//minesweeper
bootstrap_app.use(express.vhost('minesweeper.ayoshitake.com', require('./apps/minesweeper/app')(starter_app_generator)));

//fortune_cookie
bootstrap_app.use(express.vhost('fortunecookie.ayoshitake.com', require('./apps/fortune_cookie/app')(starter_app_generator)));

//magi-cal.me
bootstrap_app.use(express.vhost('magi-cal.me', require('./apps/magi_cal.me/app')(starter_app_generator)));
bootstrap_app.use(express.vhost('w.magi-cal.me', require('./apps/magi_cal.me/app')(starter_app_generator)));
bootstrap_app.use(express.vhost('ww.magi-cal.me', require('./apps/magi_cal.me/app')(starter_app_generator)));
bootstrap_app.use(express.vhost('www.magi-cal.me', require('./apps/magi_cal.me/app')(starter_app_generator)));

//template
bootstrap_app.use(express.vhost('w.ayoshitake.com', require('./apps/template/app')(starter_app_generator)));

//default - portal
bootstrap_app.use(express.vhost('*', require('./apps/ayoshitake.com/app')(starter_app_generator)));
//DO NOT ADD MORE VHOSTS AFTER THIS WILDCARD RULE

//Configure Production Mode
bootstrap_app.configure('production', function () {
  bootstrap_app.use(express.errorHandler());
});

//tell this server to listen on port X.
//thus, this server is accessible at the URL:
//  [hostname]:X
//where [hostname] is the IP address or any of the domains we're hosting
bootstrap_server.listen(9000);

//this is printed after the server is up
//console.log("bootstrap server listening on port %d in %s mode", bootstrap_app.address().port, bootstrap_app.settings.env);