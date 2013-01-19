module.exports = function (app) {
  var passport = require('passport'),
      auth = require('./modules/auth');

  app.get('/login', function (req, res) {
    //console.log("GET /login called!");
    //Show the login form.
    res.render('login', {
      message: req.flash('error'),
      next: req.query.next,
      title: 'ayoshitake.com Login'
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
    res.redirect('/');
  });
};