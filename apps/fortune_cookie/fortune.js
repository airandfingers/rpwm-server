module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , db = require('../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , FortuneSchema = new Schema({
      fortune     : String                             //the text of the fortune
    , created_at  : { type : Date, default: Date.now } //when the fortune was created
    });

  FortuneSchema.statics.findRandom = function(cb) {
    var model = this;
    model.count({}, function(err, fortunes_count) {
      if (err) { return cb(err); }
      var num_to_skip = Math.floor(Math.random() * fortunes_count);
      model.findOne()
          .skip(num_to_skip)
          .exec(function(err2, result) {
        if (err2) { cb(err2); }
        else { cb(null, result); }
      });
    })
  };

  var Fortune = mongoose.model('Fortune', FortuneSchema);

  return Fortune;
})();