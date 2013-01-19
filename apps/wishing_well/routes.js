module.exports = function (app) {
  var Wish = require('./wish')
    , auth = require('../../modules/auth');

  app.get('/', function (req, res) {
    console.log('index called');
    res.render('index', {title: "Make a Wish in the Wishing Well"});
  });

  //Handle incoming wishes
  app.post('/wish', function (req, res) {
    console.log('wish made:', req.body.wish);
    new Wish({
      wish: req.body.wish
    , user: req.user
    }).save(function(err) {
      if (err) { next(err); }
      else { res.end('Wish made: ' + JSON.stringify(req.body)); }
    });
  });

  //Display wishes made so far
  app.get('/view_wishes', auth.ensureAuthenticated, function (req, res, next) {
    console.log('view_wishes called');
    Wish.find({})
      .sort('_id')
      .select('wish user')
      .populate('user', 'username')
      .exec(function(err, results) {
        if (err) {
          next(err);
        }
        else {
          console.log('wishes found:', results);
          res.render('view_wishes', {
            wishes: results,
            title: 'Wishes people have made so far'
          });
        }
      });
  });

  /*Handle all other cases with a 404
  ONLY do this if app.use(app.router) comes after app.use(express.static)
  in this app's configuration; otherwise, this route will catch
  all incoming requests, including requests for static files that exist.*/
  app.all('*', function(req, res) {
    res.redirect('/404.html');
  });
};