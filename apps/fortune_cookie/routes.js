module.exports = function (app) {
  var FortuneProvider = require('./fortune_provider')
    , fortune_provider = new FortuneProvider()
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
    fortune_provider.save({fortune: req.param('fortune')}, function(error, docs) {
      res.redirect('/')
    });
  });

  //Display one (random) fortune from database
  app.get('/fortune_cookie', function (req, res) {
    console.log('fortune_cookie called');
    fortune_provider.findRandom(function(error, result) {
      console.log(error, result);
      res.render('fortune_cookie', {title: "Fortune Cookie!", result: result});
    });
  });

  //Display all fortunes in database
  app.get('/view_fortunes.:format?', function (req, res) {
    console.log('view_fortunes called with format ', req.params.format);
    fortune_provider.findAll(function(error, results) {
      console.log(error, results);
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
  app.get('/manage_fortunes', auth.ensureAuthenticated, function (req, res) {
    console.log('manage_fortunes called');
    fortune_provider.findAll(function(error, results) {
      console.log(error, results);
      res.render('manage_fortunes',
        {title: "Here's where we manage the magic",
        results: results, manage: true}
      );
    });
  });

  //Remove specified fortune from database
  app.get('/remove_fortune/:id', auth.ensureAuthenticated, function (req, res) {
    console.log('remove_fortune called on id ', req.params.id);
    fortune_provider.remove(req.params.id, function(error, results) {
      console.log(error, results);
      res.redirect('/manage_fortunes');
    });
  });

  //Remove specified fortune from database
  var id, new_fortune;
  app.post('/change_fortune', function (req, res) {
    //@param id (req.body.id) The (MongoDB) ID of the fortune to change
    //@param new_fortune (req.body.new_fortune) The text to change the fortune to
    id = req.body.id;
    id = id.split('_');
    id = id[id.length - 1];
    console.log('change_fortune called on fortune with _id ', id);

    new_fortune = req.body.new_fortune;
    console.log('new fortune is ' + new_fortune);

    fortune_provider.update(id, new_fortune, function(error, new_fortune) {
      //console.log(error, new_fortune);
    });
    res.send('Update complete!');
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