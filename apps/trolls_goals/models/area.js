module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Record = require('./record')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , NUM_MS_IN_DAY = 86400000
    , dateToDayNum = function(date) {
      return Math.floor(date.getTime() / NUM_MS_IN_DAY);
    }
    , dayNumToDate = function(day_num) {
      return new Date(day_num * NUM_MS_IN_DAY);
    }

    , AreaSchema = new Schema({
        name: { type: String, required: true, index: true } // the area's unique name
      , description: { type: String } // a description of the area
      , domain: { type: ObjectId, ref: 'domains', index: true }
      , user: { type: ObjectId, ref: 'users', index: true }
      , records: { type: Schema.Types.Mixed, default: function() { return {}; } } // Date: number of records
      , start_day: { type: Number, default: function() { return dateToDayNum(new Date()); } }
      , prompt_for_details: Boolean
      , hidden: { type: Boolean } // whether this domain should be retrieved under normal circumstances
    });

  AreaSchema.statics.dateToDayNum = dateToDayNum;
  AreaSchema.statics.dayNumToDate = dayNumToDate;

  var Area = mongoose.model('Area', AreaSchema);

  Area.update_fields = ['name', 'description', 'domain', 'prompt_for_details', 'hidden'];

  Area.deleteHook = function(_id, cb) {
    Record.remove({ area: _id }, cb);
  };

  return Area;
})();