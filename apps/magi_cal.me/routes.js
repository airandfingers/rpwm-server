module.exports = function(app) {
  app.get('/', function (req, res) {
    console.log('index called');
    res.render('index', {title: "Magi-Cal.Me - Home of the Great Magi-Cal!"});
  });
  //Handle all other cases with a 404
  //Note: ONLY do this if app.use(app.router) comes after
  //      app.use(express.static) in this app's configuration;
  //      otherwise, this route will catch all incoming requests,
  //      including requests for static files that exist.
  app.all('*', function(req, res) {
    res.redirect('/');
  }); 
};