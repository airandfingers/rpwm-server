var _ = require('underscore')
  , async = require('async')
  , User = require('../../modules/user')
  , Record = require('./models/record')
  , Area = require('./models/area')
  , Domain = require('./models/domain')
  , usernames_to_ids = {};

async.series([
  function(acb) {
    User.find(function(find_err, users) {
      if (find_err) { return acb(find_err); }
      _.each(users, function(user) {
        usernames_to_ids[user.username] = user._id;
      });
      acb();
    });
  },
  function(acb) {
    async.parallel([
      function(iacb) {
        Record.find(function(find_err, records) {
          if (find_err) { return iacb(find_err); }
          async.forEach(records, function(record, iiacb) {
            /*if (_.isString(record.username) && _.isUndefined(record.user)) {
              record.user = usernames_to_ids[record.username];
              record.save(iiacb);
            }*/
            record.username = undefined;
            record.save(iiacb);
          }, iacb);
        });
      },
      function(iacb) {
        Area.find(function(find_err, areas) {
          if (find_err) { return iacb(find_err); }
          async.forEach(areas, function(area, iiacb) {
            /*if (_.isString(area.username) && _.isUndefined(area.user)) {
              area.user = usernames_to_ids[area.username];
              area.save(iiacb);
            }*/
            area.username = undefined;
            area.save(iiacb);
          }, iacb);
        });
      },
      function(iacb) {
        Domain.find(function(find_err, domains) {
          if (find_err) { return iacb(find_err); }
          async.forEach(domains, function(domain, iiacb) {
            /*if (_.isString(domain.username) && _.isUndefined(domain.user)) {
              domain.user = usernames_to_ids[domain.username];
              domain.save(iiacb);
            }*/
            domain.username = undefined;
            domain.save(iiacb);
          }, iacb);
        });
      }
    ], acb)
  }
], function(err) {
  console.log('Done! err is', err);
  process.exit();
})