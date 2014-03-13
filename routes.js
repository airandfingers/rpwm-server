var app = require('./bootstrap').app
  , _ = require('underscore') // list utility library
  , User = require('./modules/user')
  , passport = require('passport')
  , auth = require('./modules/auth')

  , getFlashFromReq = function(req) {
  var flash = req.flash('error');
  return flash && flash[0];
}

app.get('/login', function (req, res) {
  // Show the login form.
  res.render('login', {
    message: getFlashFromReq(req),
    next: req.query.next,
    title: 'ayoshitake.com Login'
  });
});

app.get('/register', function(req, res) {
  var next_page = req.query.next || base_page;
  res.render('register', {
    message: getFlashFromReq(req),
    next: req.query.next,
    title: 'Come, join us!', 
  });
});

app.post('/login',
         passport.authenticate('local', 
                               { failureRedirect: '/login', 
                                 failureFlash: true }),
         function (req, res) {
  // Authentication successful. Redirect.
  var target = req.body.next || '/';
  if (_.isString(target)) {
    // Validate target, to prevent redirection attacks.
    if (target.match(/[\x00-\x1F]/) !== null || // Contains an invalid character
        target.match(/^\//)       === null || // Doesn't start with /
        target.match(/^\/\//)     !== null) { // Starts with //
      console.error('Invalid redirection target.');
      target = '/';
    }
  }
  else {
    res.redirect(target);
  }
});

app.post('/register', function (req, res, next) {
  var username = req.body.username,
      password = req.body.password,
      password_confirm = req.body.password2,
      target = req.body.next || '/';

  if (password === password_confirm) {
    new User({
      username: username,
      password: password
    }).save(function(err, result) {
      if (err) {
        req.flash('error', err.message);
        res.redirect('/register?next=' + target);
      }
      else {
        // Registration successful. Redirect.
        console.log('registration successful!');
        req.flash('error', 'Please log in with your new username and password.');
        res.redirect('/login');
        /*req.url = req.originalUrl = '/login';
        app.router._dispatch(req, res, next);*/
      }
    });
  }
  else {
    console.log('password fields did not match!');
    req.flash('error', 'password fields did not match!');
    res.redirect('/register?next=' + target);
  }
});

app.get('/logout', function (req, res) {
  //End this user's session.
  req.logout();
  res.redirect('/');
});