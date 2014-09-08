module.exports = (function() {
  var mongoose = require('mongoose') // MongoDB abstraction layer
    , async = require('async') // async
    , _ = require('underscore') // list utility library
    , db = require('../../../modules/db')
    , Area = require('./area')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId

    , DomainSchema = new Schema({
        name: { type: String, index: true } // the domain's name
      , description: { type: String } // a description of the domain
      , username: { type: String, index: true }
      , user: { type: ObjectId, ref: 'users', index: true }
      , hidden: { type: Boolean } // whether this domain should be retrieved under normal circumstances
    });

  var Domain = mongoose.model('Domain', DomainSchema);

  Domain.update_fields = ['name', 'description'];

  Domain.deleteHook = function(_id, cb) {
    Area.find({ domain: _id }, function(find_err, areas) {
      async.each(areas, function(area, acb) {
        async.parallel([
          function(inner_acb) { area.remove(inner_acb); }
        , function(inner_acb) { Area.deleteHook(area._id, inner_acb); }
        ], acb);
      }, cb);
    });
  };

  return Domain;
})();