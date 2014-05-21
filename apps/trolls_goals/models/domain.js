module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , DomainSchema = new Schema({
        name: { type: String, unique: true, index: true } // the tag's unique name
      , description: { type: String } // a description of the tag
      , username: { type: String, index: true }
    });

  var Domain = mongoose.model('Domain', DomainSchema);

  Domain.update_fields = ['name', 'description'];

  return Domain;
})();