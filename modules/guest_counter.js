module.exports = (function() {
  var mongoose = require('mongoose') // MongoDB abstraction layer
    , Schema = mongoose.Schema // Mongoose Schema constructor
    , ObjectId = Schema.ObjectId // Mongoose ObjectId type

    , _ = require('underscore') // list utility library
    
    , db = require('./db'); // make sure db is connected


  /* Create collection */
  var GuestCounterSchema = new Schema({
    next: Number
  });

  /* Create static method on schema, incrementing the guest counter */
  GuestCounterSchema.statics.increment = function (callback) {
    this.collection.findAndModify({}, [], { $inc: { next: 1 } }, {},
                                         function(err, guest_counter) {
      //console.log('findAndModify returns', err, guest_counter);
      if (_.isFunction(callback)) {
        callback(err, guest_counter && guest_counter.next);
      }
    });
  };

  /* Create model */
	var GuestCounter = mongoose.model('guest_counter', GuestCounterSchema);

  /* create a single counter if none currently exists */
  GuestCounter.find(function(err, guest_counters) {
    if (guest_counters.length === 0) {
      console.log('Creating guest counter with next=0');
      new GuestCounter({ next: 0 }).save();
    }
  });

  return GuestCounter;
})();