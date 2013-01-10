module.exports = function (app, auth) {
  var passport = require('passport');

  app.get('/login', function (req, res) {
    //console.log("GET /login called!");
    //Show the login form.
    res.render('login', {
      message: req.flash('error'),
      next: req.query.next,
      title: 'Markslist Login'
    });
  });

  app.post('/login', 
           passport.authenticate('local', 
                                 { failureRedirect: '/login', 
                                   failureFlash: true }),
           function (req, res) {
    // Authentication successful. Redirect.
    //console.log("POST /login called!");
    var target = req.body.next;
    if (target) {
      res.redirect(target);
    }
    else {
      res.redirect('/');
    }
  });

  app.get('/logout', auth.ensureAuthenticated, function (req, res) {
    //console.log("GET /logout called!");
    //End this user's session.
    req.logout();
    res.redirect('/login');
  });

  //Handle all other cases with a 404
  //Note: ONLY do this if app.use(app.router) comes after
  //      app.use(express.static) in this app's configuration;
  //      otherwise, this route will catch all incoming requests,
  //      including requests for static files that exist.
  /*app.all('*', function(req, res) {
    res.redirect('/404.html');
  });*/
};