module.exports = (function() {
  var mongoose = require('mongoose') //MongoDB abstraction layer
    , db = require('../../modules/db')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , DocSchema = new Schema({
      title       : { type: String, required: true, unique: true } // the title of the document
    , contents    : { type: String, default: '#Placeholder\n**Edit me!**' } //the text of the document
    , created_at  : { type: Date, default: Date.now } //when the doc was created
    , modified_at : { type: Date, default: Date.now } // when the doc was last modified
    , user        : { type: ObjectId, ref: 'User' } //the user who created the doc
    })

    , Doc = mongoose.model('Doc', DocSchema);

  return Doc;
})();