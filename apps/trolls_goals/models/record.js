module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , RecordSchema = new Schema({
        area: { type: ObjectId, ref: 'areas', index: true }
      , details: { type: String } // a details of the record
      , username: { type: String, index: true }
      , user: { type: ObjectId, ref: 'users', index: true }
      , day: Number // days since 1970.1.1
    });

  var Record = mongoose.model('Record', RecordSchema);

  Record.update_fields = ['details'];

  return Record;
})();