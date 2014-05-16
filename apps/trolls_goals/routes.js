module.exports = function(app) {
  var _ = require('underscore')
    , Record = require('./models/record')
    , Category = require('./models/category')
    , Tag = require('./models/tag');

  app.get('/', function(req, res) {
    res.render('index', { title: 'Troll\'s Goals!' });
  });

  var models = {
    record: Record
  , category: Category
  , tag: Tag
  };

  // Custom Model-specific routes
  app.get('/api/record/query', function(req, res) {
    var category_ids = req.query.category_ids
      , day_range = req.query.day_range
      , query = { username: req.user.username };

    if (_.isString(category_ids)) {
      category_ids = [category_ids];
    }
    if (_.isArray(category_ids)) {
      query.category = { $in: category_ids };
    }

    if (_.isString(day_range)) {
      day_range = parseInt(day_range);
      if (_.isNaN(day_range)) {
        console.error('Unable to parse day_range:', req.query.day_range);
      }
      else {
        query.day = { $gte: day_range };
      }
    }
    else if (_.isArray(day_range)) {
      day_range[0] = parseInt(day_range[0]);
      day_range[1] = parseInt(day_range[1]);
      if (_.isNaN(day_range[0]) || _.isNaN(day_range[1])) {
        console.error('Unable to parse day_range:', req.query.day_range);
      }
      else {
        query.day = { $gte: day_range[0], $lte: day_range[1] };
      }
    }

    Record.find(query, function(find_err, docs) {
      if (find_err) {
        return res.error(find_err);
      }
      res.json(docs);
    });
  });

  // Common CRUD routes
  _.each(models, function(Model, model_name) {
    app.get('/api/' + model_name, function(req, res) {
      var query = { username: req.user.username };
      Model.find(query, function(find_err, docs) {
        if (find_err) {
          return res.error(find_err);
        }
        res.json(docs);
      });
    });

    app.get('/api/' + model_name + '/:_id', function(req, res) {
      var _id = req.params._id
        , query = { username: req.user.username, _id: _id };
      if (_.isEmpty(_id)) {
        return res.error('No _id provided.');
      }
      Model.findOne(query, function(find_err, doc) {
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
      spec.username = req.user.username;
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
        , query = { username: req.user.username, _id: _id }
        , update_obj;
      if (_.isEmpty(_id)) {
        return res.error('No _id provided.');
      }
      update_obj = _.pick(req.body, Model.update_fields);
      if (_.isEmpty(update_obj)) {
        return res.error('No valid fields to update.');
      }
      Model.findOneAndUpdate(query, { $set: update_obj },
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
      var _id = req.params._id
        , query = { username: req.user.username, _id: _id };
      if (_.isEmpty(_id)) {
        return res.error('No _id provided.');
      }
      Model.findOneAndRemove(query, function(remove_err, removed) {
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