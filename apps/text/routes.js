module.exports = function(app) {
  app.post('/save', function(req, res) {
    console.log('/save called with', req.body.contents);
    res.json({ saved: true });
  });
  //Handle all other cases with a 404
  //Note: ONLY do this if app.use(app.router) comes after
  //      app.use(express.static) in this app's configuration;
  //      otherwise, this route will catch all incoming requests,
  //      including requests for static files that exist.
  app.all('*', function(req, res) {
    res.status(404).sendfile('/404.html');
  }); 
};