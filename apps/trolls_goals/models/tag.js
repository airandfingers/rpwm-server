module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , TagSchema = new Schema({
        name: { type: String, unique: true } // the tag's unique name
      , description: { type: String } // a description of the tag
    });

  var Tag = mongoose.model('Tag', TagSchema);

  Tag.update_fields = ['name', 'description'];

  return Tag;
})();