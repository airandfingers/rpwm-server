module.exports = function(app, io) {
  io.sockets.on('connection', function(socket) {
    //console.log('A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
    socket.emit('syn ack');

    socket.on('ack', function () {
      console.log('Ack received.');
    });

    socket.on('setName', function (data) {
      console.log('setting name to ', data.name);
      socket.set('name', data.name);
      console.log('Emitting message', 'logMessage', {message: 'A player chose a name: ' + data.name});
      io.sockets.emit('logMessage', {message: 'A player chose a name: ' + data.name});
    });

    socket.on('move', function(data) {
      console.log('Emitting message', 'move', data);
      io.sockets.emit('move', data);
    });

    socket.on('placeFence', function(data) {
      console.log('Emitting message', 'placeFence', data);
      io.sockets.emit('placeFence', data);
    });

    socket.on('undo', function(data) {
      console.log('Emitting message', 'undo', data);
      io.sockets.emit('undo', data);
    });

    socket.on('removeFence', function(data) {
      console.log('Emitting message', 'removeFence', data);
      io.sockets.emit('removeFence', data);
    });

    socket.on('chatMessage', function(data) {
      console.log('Emitting message', 'chatMessage', data);
      io.sockets.emit('chatMessage', data);
    });

    socket.on('unload', function(data) {
      data = {message: data.name + ' has left the game!'};
      console.log('Emitting message', 'logMessage', data);
      io.sockets.emit('logMessage', data);
    });

    /*socket.on('connect', function(data) {
      console.log('Connected', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' connected.'});
        io.sockets.emit('logMessage', {message: name + ' connected.'});
      });
    });

    socket.on('connecting', function(data) {
      console.log('Connecting', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' connecting.'});
        io.sockets.emit('logMessage', {message: name + ' connecting.'});
      });
    });

    socket.on('disconnect', function(data) {
      console.log('Disconnected', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' disconnected.'});
        io.sockets.emit('logMessage', {message: name + ' disconnected.'});
      });
    });

    socket.on('connect_failed', function(data) {
      console.log('Connect_failed', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' connect_failed.'});
        io.sockets.emit('logMessage', {message: name + ' connect_failed.'});
      });
    });

    socket.on('error', function(data) {
      console.log('Error', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' error.'});
        io.sockets.emit('logMessage', {message: name + ' error.'});
      });
    });

    socket.on('reconnect_failed', function(data) {
      console.log('Reconnect_failed', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' reconnect_failed.'});
        io.sockets.emit('logMessage', {message: name + ' reconnect_failed.'});
      });
    });

    socket.on('reconnect', function(data) {
      console.log('Reconnected', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' reconnected.'});
        io.sockets.emit('logMessage', {message: name + ' reconnected.'});
      });
    });

    socket.on('reconnecting', function(data) {
      console.log('Reconnecting', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' reconnecting.'});
        io.sockets.emit('logMessage', {message: name + ' reconnecting.'});
      });
    });

    socket.on('retry', function(data) {
      console.log('Retry', data);
      socket.get('name', function(err, name) {
        console.log('Emitting message', 'logMessage', {message: name + ' retrying.'});
        io.sockets.emit('logMessage', {message: name + ' retrying.'});
      });
    });*/
  });

  app.get('/', function(req, res) {
    var num_cols = req.query.num_cols || 9
      , num_rows = req.query.num_rows || 9;
    res.render('index', {title: 'Corridor!', num_cols: num_cols, num_rows: num_rows});
    console.log( req.path );
    io.sockets.emit('logMessage', {message: 'A challenger appears! ' + req.headers.host + req.originalUrl });
  });
  //Handle all other cases with a 404
  //Note: ONLY do this if app.use(app.router) comes after
  //      app.use(express.static) in this app's configuration;
  //      otherwise, this route will catch all incoming requests,
  //      including requests for static files that exist.
  app.all('*', function(req, res) {
    res.redirect('/404.html');
  });
};