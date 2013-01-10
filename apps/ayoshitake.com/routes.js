module.exports = function(app) {
  app.get('/', function(req, res) {
    res.redirect('/home');
  });

  app.get('/home', function(req, res) {
    res.render('index', {title: 'ayoshitake.com welcomes you!', current_page: 'home'});
  });
  
  app.get('/about', function(req, res) {
    res.render('about', {title: 'All about us!', current_page: 'about'});
  });
  
  app.get('/contact', function(req, res) {
    res.render('contact', {title: 'Drop us a line!', current_page: 'contact'});
  });
  
  app.get('/blah', function(req, res) {
    res.render('blah', {title: 'Bloop Blahp Bleep Blah!', current_page: 'blah'});
  });
  
  app.get('/login', function(req, res) {
    res.render('login', {title: 'Identify yourself!', current_page: 'login'});
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