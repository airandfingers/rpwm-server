module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , getToday = function() {
      return Math.floor(new Date().getTime() / 86400000);
    }

    , CategorySchema = new Schema({
        name: { type: String, unique: true, index: true } // the category's unique name
      , description: { type: String } // a description of the category
      , tags: [{ type: ObjectId, ref: 'tags', index: true }]
      , username: { type: String, index: true }
      , records: { type: Schema.Types.Mixed, default: function() { return {}; } } // Date: number of records
      , start_day: { type: Number, default: getToday }
    });

  var Category = mongoose.model('Category', CategorySchema);

  Category.update_fields = ['name', 'description', 'tags'];

  return Category;
})();