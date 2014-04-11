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
          var error = 'Error while finding ' + model_name + 's';
          console.error(error + ':', find_err);
          return res.json(error);
        }
        res.json(docs);
      });
    });

    app.get('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id;
      if (_.isEmpty(_id)) {
        return res.json('No _id provided.');
      }
      Model.findById(_id, function(find_err, doc) {
        if (find_err) {
          var error = 'Error while finding ' + model_name;
          console.error(error + ':', find_err);
          return res.json(error);
        }
        res.json(doc);
      });
    });

    app.post('/api/' + model_name, function(req, res) {
      var spec = req.body
        , doc;
      if (_.isEmpty(spec)) {
        return res.json('Invalid spec: ' + JSON.stringify(spec));
      }
      doc = new Model(spec);
      doc.save(function(save_err) {
        if (save_err) {
          var error = 'Error while saving ' + model_name;
          console.error(error + ':', save_err);
          return res.json(error);
        }
        res.json(doc.toObject());
      });
    });

    app.put('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id
        , update_obj;
      if (_.isEmpty(_id)) {
        return res.json('No _id provided.');
      }

      update_obj = _.pick(req.body, Model.update_fields);
      if (_.isEmpty(update_obj)) {
        return res.json('No valid fields to update.');
      }

      Model.findOneAndUpdate({ _id: _id }, { $set: update_obj },
                             function(update_err, updated) {
        console.log('findOneAndUpdate returns', update_err, updated);
        if (update_err) {
          var error = 'Error while updating ' + model_name;
          console.error(error + ':', update_err);
          return res.json(error);
        }
        else if (updated === null) {
          res.json('No doc found with _id=' + _id);
        }
        else {
          res.json(updated);
        }
      });
    });

    app.delete('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id;
      if (_.isEmpty(_id)) {
        return res.json('No _id provided.');
      }
      Model.findOneAndRemove({ _id: _id }, function(remove_err, removed) {
        console.log('findOneAndRemove returns', remove_err, removed);
        if (remove_err) {
          var error = 'Error while removing ' + model_name;
          console.error(error + ':', remove_err);
          return res.json(error);
        }
        else if (removed === null) {
          res.json('No doc found with _id=' + _id);
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