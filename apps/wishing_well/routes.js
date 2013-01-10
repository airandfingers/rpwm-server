module.exports = function (app) {
  var WishProvider = require('./wish_provider')
    , wish_provider = new WishProvider();

  app.get('/', function (req, res) {
    console.log('index called');
    res.render('index', {title: "Make a Wish in the Wishing Well"});
  });

  //Handle incoming wishes
  app.post('/wish', function (req, res) {
    console.log('wish made:', req.body.wish);
    wish_provider.save({wish: req.body.wish}, function(error, docs) {
      res.end('Wish made: ' + JSON.stringify(req.body));
    });
  });

  //Display wishes made so far
  app.get('/view_wishes', function (req, res, next) {
    console.log('view_wishes called');
    
    wish_provider.findAll(function(err, results) {
      console.log('findAll returns:', err, results);
      if (err) {
        next(err);
      }
      else {
        res.render('view_wishes', {
          wishes: results,
          title: 'Wishes people have made so far'
        });
      }
    });
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