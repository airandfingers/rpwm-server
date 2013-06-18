module.exports = function(app) {
  app.get('/test', function(req, res) {
    console.log('test called');
    res.end('Hello World!');
  });
  //Handle all other cases with a 404
  //Note: ONLY do this if app.use(app.router) comes after
  //      app.use(express.static) in this app's configuration;
  //      otherwise, this route will catch all incoming requests,
  //      including requests for static files that exist.
  app.all('*', function(req, res) {
    console.log('404-ing request for', req.originalUrl);
    res.status(404);
    res.end();
    //res.redirect('/404.html');
  }); 
};