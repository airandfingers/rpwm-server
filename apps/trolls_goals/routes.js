module.exports = function(app) {
  var _ = require('underscore')
    , Activity = require('./models/activity')
    , Category = require('./models/category')
    , Tag = require('./models/tag');

  app.get('/', function(req, res) {
    res.render('index', { title: 'Troll\'s Goals!' });
  });

  var models = {
    category: Category
  , tag: Tag
  };

  _.each(models, function(Model, model_name) {
    app.get('/api/' + model_name, function(req, res) {
      Model.find(function(find_err, docs) {
        if (find_err) {
          return res.error(find_err);
        }
        res.json(docs);
      });
    });

    app.get('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id;
      if (_.isEmpty(_id)) {
        return res.error('No _id provided.');
      }
      Model.findById(_id, function(find_err, doc) {
        if (find_err) {
          return res.error(find_err);
        }
        res.json(doc);
      });
    });

    app.post('/api/' + model_name, function(req, res) {
      var spec = req.body
        , doc;
      if (_.isEmpty(spec)) {
        return res.error('Invalid spec: ' + JSON.stringify(spec));
      }
      doc = new Model(spec);
      doc.save(function(save_err) {
        if (save_err) {
          return res.error(save_err);
        }
        res.json(doc.toObject());
      });
    });

    app.put('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id
        , update_obj;
      if (_.isEmpty(_id)) {
        return res.error('No _id provided.');
      }

      update_obj = _.pick(req.body, Model.update_fields);
      if (_.isEmpty(update_obj)) {
        return res.error('No valid fields to update.');
      }

      Model.findOneAndUpdate({ _id: _id }, { $set: update_obj },
                             function(update_err, updated) {
        console.log('findOneAndUpdate returns', update_err, updated);
        if (update_err) {
          res.error(update_err);
        }
        else if (updated === null) {
          res.error('No doc found with _id=' + _id);
        }
        else {
          res.json(updated);
        }
      });
    });

    app.delete('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id;
      if (_.isEmpty(_id)) {
        return res.error('No _id provided.');
      }
      Model.findOneAndRemove({ _id: _id }, function(remove_err, removed) {
        console.log('findOneAndRemove returns', remove_err, removed);
        if (remove_err) {
          res.error(remove_err);
        }
        else if (removed === null) {
          res.error('No doc found with _id=' + _id);
        }
        else {
          res.json(removed);
        }
      });
    });
  });

  //Handle all other cases with a 404
  //Note: ONLY do this if app.use(app.router) comes after
  //      app.use(express.static) in this app's configuration;
  //      otherwise, this route will catch all incoming requests,
  //      including requests for static files that exist.
  app.all('*', function(req, res) {
    res.status(404).end();//redirect('/404.html');
  }); 
};