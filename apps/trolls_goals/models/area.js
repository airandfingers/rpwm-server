module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , getToday = function() {
      return Math.floor(new Date().getTime() / 86400000);
    }

    , AreaSchema = new Schema({
        name: { type: String, unique: true, index: true } // the area's unique name
      , description: { type: String } // a description of the area
      , domain: { type: ObjectId, ref: 'tags', index: true }
      , username: { type: String, index: true }
      , records: { type: Schema.Types.Mixed, default: function() { return {}; } } // Date: number of records
      , start_day: { type: Number, default: getToday }
    });

  var Area = mongoose.model('Area', AreaSchema);

  Area.update_fields = ['name', 'description', 'domain'];

  return Area;
})();