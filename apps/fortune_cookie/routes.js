module.exports = function (app) {
  var Fortune = require('./fortune')
    , auth = require('../../modules/auth');

  app.get('/', function (req, res) {
    console.log('index called');
    res.render('index', {title: "Choose your path.."});
  });

  app.get('/fortune_teller', function (req, res) {
    console.log('fortune_teller called');
    res.render('fortune_teller', {title: "Fortune Teller!"});
  });

  //Add a new fortune to database
  app.post('/new_fortune', function (req, res) {
    console.log('Fortune to add: ', req.body.fortune);
    new Fortune({
      fortune: req.body.fortune
    }).save(function(err) {
      if (err) { next(err); }
      else { res.redirect('/'); }
    });
  });

  //Display one (random) fortune from database
  app.get('/fortune_cookie', function (req, res) {
    console.log('fortune_cookie called');
    Fortune.findRandom(function(error, result) {
      res.render('fortune_cookie', {title: "Fortune Cookie!", result: result});
    });
  });

  //Display all fortunes in database
  app.get('/view_fortunes.:format?', function (req, res, next) {
    console.log('view_fortunes called with format ', req.params.format);
    Fortune.find({}, function(err, results) {
      if (err) { return next(err); }
      if (req.params.format === 'json') {
        res.json(results);
      }
      else {
        res.render('manage_fortunes',
          {title: "Here're all the fortunes in our almighty fortune database",
          results: results, manage: false}
        );
      }
    });
  });

  //Display a fortune-management screen with all fortunes in database
  app.get('/manage_fortunes', auth.ensureAuthenticated, function (req, res, next) {
    console.log('manage_fortunes called');
    Fortune.find({}, function(err, results) {
      if (err) { next(err); }
      else {
        res.render('manage_fortunes',
          {title: "Here's where we manage the magic",
          results: results, manage: true}
        );
      }
    });
  });

  //Remove specified fortune from database
  app.get('/remove_fortune/:id', auth.ensureAuthenticated, function (req, res, next) {
    console.log('remove_fortune called on id ', req.params.id);
    Fortune.findById(req.params.id, function(err, fortune) {
      if (err) { return next(err); }
      fortune.remove(function(err2) {
        if (err2) { next(err2); }
        else { res.redirect('/manage_fortunes'); }
      });
    });
  });

  //Remove specified fortune from database
  app.post('/change_fortune', function (req, res) {
    //@param id (req.body.id) The (MongoDB) ID of the fortune to change
    //@param new_fortune (req.body.new_fortune) The text to change the fortune to
    var id = req.body.id
      , new_fortune = req.body.new_fortune;
    id = id.split('_');
    id = id[id.length - 1];
    console.log('change_fortune called with _id ', id, ', new_fortune', new_fortune);

    Fortune.findById(id, function(err, fortune) {
      if (err) { return next(err); }
      fortune.fortune = new_fortune;
      fortune.save(function(err2) {
        if (err2) { next(err2); }
        else { res.redirect('/manage_fortunes'); }
      });
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