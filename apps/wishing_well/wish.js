module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , WishSchema = new Schema({
      wish        : String                             //the text of the wish
    , created_at  : { type : Date, default: Date.now } //when the wish was made
    , user        : { type: ObjectId, ref: 'User'}     //the user who made the wish
    })

    , Wish = mongoose.model('Wish', WishSchema);

  return Wish;
})();