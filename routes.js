var app = require('./bootstrap').app
  , _ = require('underscore') // list utility library
  , User = require('./modules/user')
  , passport = require('passport')
  , auth = require('./modules/auth')

  , base_page = '/'

  , getFlashFromReq = function(req) {
    var flash = req.flash('error');
    return flash && flash[0];
  }

  , getRedirectionTarget = function(target) {
    target = target || base_page;
    // Validate target, to prevent redirection attacks.
    if (target.match(/[\x00-\x1F]/) !== null || // Contains an invalid character
        target.match(/^\//) === null || // Doesn't start with /
        target.match(/^\/\//) !== null) { // Starts with //
      console.error('Invalid redirection target.');
      target = base_page;
    }
    return target;
  };

app.get('/login', function (req, res) {
  // Show the login form.
  if (! auth.isAuthenticated(req)) {
    res.render('login', {
      message: getFlashFromReq(req),
      next: req.query.next,
      title: 'ayoshitake.com Login'
    });
  }
  else {
    //Redirect to 'next' URL (or base page).
    res.redirect(req.query.next || base_page);
  }
});

function renderRegister(req, res) {
  if (! auth.isAuthenticated(req)) {
    res.render('register', {
      message: getFlashFromReq(req),
      next: req.query.next,
      title: 'Come, join us!', 
    });
  }
  else if (User.isGuest(req.user.username)) {
    //Show the 'conversion' form.
    res.render('register', {
      message: getFlashFromReq(req),
      next: req.query.next,
      title: 'Ready to tell us who you are?',
      mode: 'convert'
    });
  }
  else {
    //Redirect to 'next' URL (or base page).
    res.redirect(req.query.next || base_page);
  }
}
app.get('/register', renderRegister);
app.get('/guest_convert', renderRegister);

//Guest Login Route
function createGuestUser(req, res) {
  console.log('guest_login route fired!');

  var target = getRedirectionTarget(req.body.next || req.query.next);
  User.createGuestUser(function(create_err, user) {
    if (create_err) {
      req.flash('error', create_err.message);
      return res.redirect('/login?next=' + target);
    }
    user.save(function(save_err, result) {
      if (save_err) {
        req.flash('error', save_err.message);
        return res.redirect('/login?next=' + target);
      }
      // Guest_Registration successful. Redirect.
      console.log('Guest registration successful!');
      req.login(user, function(login_err) {
        //console.log('login_err is', login_err, ', req.user is', req.user);
        if (login_err) {
          req.flash('error', login_err.message);
          return res.redirect('/login?next=' + target);
        }
       res.redirect(target);
      });
    });
  });
}
app.post('/guest_login', createGuestUser);
app.get('/guest_login', createGuestUser);

app.post('/login',
         passport.authenticate('local', 
                               { failureRedirect: '/login', 
                                 failureFlash: true }),
         function (req, res) {
  // Authentication successful. Redirect.
  res.redirect(getRedirectionTarget(req.body.next));
});

app.post('/register', function (req, res, next) {
  var username = req.body.username,
      pt_password = req.body.password,
      password_confirm = req.body.password_confirm,
      target = getRedirectionTarget(req.body.next);

  if (_.isEmpty(username) || _.isEmpty(pt_password)) {
    req.flash('error', 'Cannot register without both username and password!');
    return res.redirect('/register?next=' + target);
  }

  if (pt_password !== password_confirm) {
    //console.log('password fields did not match!');
    req.flash('error', 'Password fields did not match!');
    return res.redirect('/register?next=' + target);
  }

  if (auth.isAuthenticated(req)) {
    if (User.isGuest(req.user.username)) {
      console.log('augmenting', req.user.username, 'with spec:',
                  { username: username, pt_password: pt_password });
      req.user.convertFromGuest({
        username: username, pt_password: pt_password
      }, function(convert_err, user) {
        if (convert_err) {
          req.flash('error', convert_err.message || convert_err);
          return res.redirect('/register?next=' + target);
        }
        req.login(user, function(login_err) {
          //console.log('error is', login_err, '\n req.user is', req.user);
          if (login_err) {
            req.flash('error', login_err.message);
            return res.redirect('/login?next=' + target);
          }
         res.redirect(target);
        });
      });
    }
    else {
      console.error('Already-authenticated non-guest user trying to register!');
      res.redirect(target);
    }
  }
  else {
    console.log('creating user with spec:',
                { username: username, pt_password: pt_password });
    User.createUser({
      username: username, pt_password: pt_password
    }, function(create_err, user) {
      console.log('createUser returns', create_err, user);
      if (create_err) {
        req.flash('error', create_err);
        return res.redirect('/register?next=' + target);
      }
      // Registration successful. Log in.
      req.login(user, function(login_err) {
        console.log('error is', login_err, '\n req.user is', req.user);
        if (login_err) {
          req.flash('error', login_err.message);
          return res.redirect('/login?next=' + target);
        }
       res.redirect(target);
      });
    });
  }
});

app.get('/check_username', function(req, res) {
  var username = req.query.username;
  if (User.isGuest(username)) {
    return res.json('Your username may not begin with "guest".');
  }
  if (_.escape(username) !== username) {
    return res.json('The following characters are not allowed in usernames: & < > " \' /');
  }
  User.findOne({ username: username }, function(find_err, user) {
    if (find_err) {
      console.error('Error while trying to look up user named', username, find_err);
      return res.json('Sorry, something went wrong. We\'ll look into it.');
    }
    if (user) {
      return res.json('The name ' + username + ' is already taken.')
    }
    res.json(true);
  });
});

app.get('/logout', function (req, res) {
  //End this user's session.
  req.logout();
  res.redirect('/');
});