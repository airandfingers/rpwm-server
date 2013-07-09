module.exports = function(app) {
  var Doc = require('./doc')
    , auth = require('../../modules/auth')

    , _ = require('underscore')
    , moment = require('moment');

  app.get('/', function(req, res) {
    res.redirect('/view');
    // TODO: conditional redirect: show "register/login to use" message to logged-out users
  });

  app.get('/view', auth.ensureAuthenticated, function (req, res, next) {
    var error = req.query.error;
    console.log('view_docs called; req.user=', req.user);
    Doc.find({ user: req.user._id })
      .sort('-modified_at')
      .select('title created_at modified_at')
      .exec(function(err, results) {
        if (err) {
          next(err);
        }
        else {
          console.log('docs found:', results);
          res.render('view', {
            docs: results
          , title: req.user.username + '\'s Docs'
          , error: error
          , _: _
          , moment: moment
          });
        }
      });
  });

  app.post('/create', auth.ensureAuthenticated, function(req, res, next) {
    var doc_title = req.body.title
      , new_doc = new Doc({ user: req.user._id, title: doc_title });
    console.log('/create called with', doc_title, 'for', new_doc);
    new_doc.save(function(err, saved_doc) {
      if (err) {
        console.log('create err:', err);
        res.redirect('/view?error=' + err);
      }
      else {
        res.redirect('/edit/' + doc_title);
      }
    });
  })

  app.get('/edit/:doc_title', auth.ensureAuthenticated, function(req, res, next) {
    var doc_title = req.params.doc_title;
    console.log('/edit called with', doc_title);
    Doc.findOne({ title: doc_title })
      .select('title contents modified_at')
      .exec(function(err, result) {
        if (err) {
          next(err);
        }
        else if (_.isNull(result)) {
          res.redirect('/view?error=No doc with title ' + doc_title);
        }
        else {
          console.log('doc found:', result);
          res.render('edit', {
            doc: result,
            title: 'Edit ' + result.title
          });
        }
      });      
  });

  app.post('/update/:doc_title', function(req, res) {
    var doc_title = req.params.doc_title
      , new_contents = req.body.contents;
    console.log('/save called with', doc_title, 'for', req.body.contents);
    Doc.update({ title: doc_title },
               { contents: new_contents, modified_at: new Date() })
      .exec(function(err, result) {
        if (err) {
          next(err);
        }
        else if (_.isNull(result)) {
          res.json({ error: 'No doc with title ' + doc_title });
        }
        else {
          console.log('doc updated:', result);
          res.json({ saved: true });
        }
      });
  });

  app.get('/delete/:doc_title', auth.ensureAuthenticated, function(req, res, next) {
    var doc_title = req.params.doc_title;
    console.log('/delete called with', doc_title);
    Doc.findOne({ title: doc_title })
      .exec(function(err, result) {
        if (err) {
          next(err);
        }
        else if (_.isNull(result)) {
          res.redirect('/view?error=No doc with title ' + doc_title);
        }
        else {
          console.log('doc found:', result);
          result.remove(function(err) {
            if (err) {
              next(err);
            }
            else {
              res.redirect('/view');
            }
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
    res.status(404)
       .sendfile('404.html', { root: __dirname + '/public' });
  }); 
};