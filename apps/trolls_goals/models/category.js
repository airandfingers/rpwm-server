module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , CategorySchema = new Schema({
        name: { type: String, unique: true } // the category's unique name
      , description: { type: String } // a description of the category
      , tags: [{ type: ObjectId, ref: 'tags' }]
    });

  var Category = mongoose.model('Category', CategorySchema);

  Category.update_fields = ['name', 'description', 'tags'];

  return Category;
})();