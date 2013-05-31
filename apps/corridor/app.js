module.exports = function(starter_app_generator) {
  var express = require('express'), // our web framework
      http = require('http'), // Node's built-in HTTP module
      app = starter_app_generator(), // our express app
      server = http.createServer(app), // the web server itself
      //MongoStore = require('connect-mongo')(express), //used as our session store
//, parseCookie = require('connect').utils.parseCookie //parseCookie function used to parse cookies

      io = require('socket.io').listen(server); //abstracted-out bidirectional communication

	/*var session_settings = {
    db_name: 'express_sessions',
    secret: '1Bl0cKuRP4WN',
    sid_name: 'express.sid',
  }, sessionStore = new MongoStore({db: session_settings.db_name});*/
  //Middleware Configuration
  app.configure(function() {
    app.set('site_name', 'corridor');
    app.set('views', __dirname + '/views');
    app.use(express.cookieParser()); //parse cookies the client sends over
    /*app.use(express.session({
      store: sessionStore, //where to store sessions
      secret: session_settings.secret, //seed used to randomize some aspect of sessions?
      key: session_settings.sid_name, //the name under which the session ID will be stored
    })); //enable session use with these settings*/
    app.use(express.methodOverride()); //allows setting a "method" param to override actual HTTP method used
    
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);

    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('log level', 1);                    // reduce logging
    io.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket'
      , 'xhr-polling'
      //, 'flashsocket'
      , 'htmlfile'
      , 'jsonp-polling'
    ]);
    io.set('close timeout', 30);
 
    /*io.set('authorization', function (data, accept) {
      // check if there's a cookie header
      if (data.headers.cookie) {
        console.log('data: ', data);
        // if there is, parse the cookie
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie[session_settings.sid_name];
        sessionStore.get(data.sessionID, function (err, session) {
          if (err || !session) {
            console.log('get returns', err, session);
            // if we cannot grab a session, turn down the connection
            accept('Error', false);
          } else {
            // save the session data and accept the connection
            data.session = session;
            accept(null, true);
          }
        });
      } else {
        // if there isn't, turn down the connection with a message
        // and leave the function.
        return accept('No cookie transmitted.', false);
      }
      // accept the incoming connection
      accept(null, true);
    });*/
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

  require('./routes')(app, io);

  return server;
};