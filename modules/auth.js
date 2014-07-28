module.exports = (function () {
  var User = require('./user')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

  // Define how to authenticate users (by using User.authenticate)
  passport.use(new LocalStrategy(
    function (username, password, done) {
      // Return an error, a user, or a message explaining why login failed
      User.authenticate(username, password, function(err, user) {
        if (err) {
          return done(err);
        }
        else if (! user) {
          return done(null, false, { message: 'Invalid credentials!' });
        }
        else {
          return done(null, user);
        }
      });
    }
  ));

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session. Typically,
  //   We store the user's ID when serializing, and find the user by ID when deserializing.
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    // Return an error, a user, or a message explaining why deserialization failed
    User.getByIdWithoutPassword(id, function(find_err, user) {
      if (find_err) {
        done(find_err);
      }
      else if (user instanceof User) {
        done(null, user);
      }
      else {
        done(null, false, { message: 'Unknown id!' });
      }
    });
  });

  function isAuthenticated(req) {
    return req.isAuthenticated();
  }

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected. If
  //   the request is authenticated the request will proceed. Otherwise, the user
  //   will be redirected to the login page.
  function ensureAuthenticated(req, res, next) {
    if (isAuthenticated(req)) {
      return next();
    }
    else if (req.method !== 'GET') {
      res.status(401);
      res.end();
    }
    else {
      req.flash('error', 'You must log in before accessing ' + req.headers.host + req.originalUrl);
      var redirect_url = '/login?next=' + req.url;
      res.redirect(redirect_url);
    }
  }

  return {
    isAuthenticated: isAuthenticated,
    ensureAuthenticated: ensureAuthenticated
  };
})();