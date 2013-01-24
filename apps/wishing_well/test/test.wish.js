//test boilerplate
var tu = require('../../../modules/test_utils')
//modules being tested
  , Wish = require('../wish')
  , User = require('../../../modules/user');
//chai.use(require('chai-date'));

describe('Wish', function() {
  var user_wish_doc = {
    wish: 'test wish',
    user: new User({
      username: 'test_user',
      password: 'test_password'
    })._id
  }, anonymous_wish_doc = {
    wish: 'test wish'
  }, wish_docs = [user_wish_doc, anonymous_wish_doc];
  tu.testModel(Wish, wish_docs);

  /*describe('instance with user', function() {
    var user_wish;
    before(function(done) {
      user_wish = new Wish({
        wish: 'test wish',
        user: new User({
          username: 'test_user',
          password: 'test_password'
        })
      });
      Wish.remove({ wish: user_wish.wish }, done);
    })

    //Test out mongoose methods
    it('should save without error', function(done) {
      user_wish.save(done);
    })
    it('can be found by _id', function(done) {
      Wish.findOne({ _id: user_wish._id }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(tu.err('no wish found with _id ' + user_wish._id)); }
        else if (result._id.toString() !== user_wish._id.toString()) { done(tu.err('found a different wish from user_wish!')); }
        else { done(); }
      });
    })
    it('can be found by wish', function(done) {
      Wish.findOne({ wish: user_wish.wish }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(tu.err('no wish found with _id ' + user_wish._id)); }
        else if (result._id.toString() !== user_wish._id.toString()) { done(tu.err('found a different wish from user_wish!')); }
        else { done(); }
      });
    })
    it('should remove without error', function(done) {
      user_wish.remove(done);
    })
    it('cannot be found by _id', function(done) {
      Wish.findOne({ _id: user_wish._id }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(); }
        else if (result._id.toString() !== user_wish._id.toString()) { done(); }
        else { done(tu.err('found user_wish when it should have been removed!')); }
      });
    })
    it('cannot be found by wish', function(done) {
      Wish.findOne({ wish: user_wish.wish }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(); }
        else if (result._id.toString() !== user_wish._id.toString()) { done(); }
        else { done(tu.err('found user_wish when it should have been removed!')); }
      });
    })
  })

  describe('instance without user', function() {
    var anonymous_wish;
    before(function(done) {
      anonymous_wish = new Wish({
        wish: 'test wish'
      });
      Wish.remove({ wish: anonymous_wish.wish }, done);
    })

    //Verify that properties exist (or don't)
    it('should have a wish property', function() {
      anonymous_wish.should.have.property('wish');
    })
    it('should have a created_at property equal to today', function() {
      anonymous_wish.should.have.property('created_at');
      //anonymous_wish.created_at.should.be.today();
    })
    it('shouldn\'t have a user property', function() {
      anonymous_wish.should.not.have.property('user');
    })
    it('should have an _id property', function() {
      anonymous_wish.should.have.property('_id');
    })

    //Test out mongoose methods
    it('should save without error', function(done) {
      anonymous_wish.save(done);
    })
    it('can be found by _id', function(done) {
      Wish.findOne({ _id: anonymous_wish._id }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(tu.err('no wish found with _id ' + anonymous_wish._id)); }
        else if (result._id.toString() !== anonymous_wish._id.toString()) { done(tu.err('found a different wish from anonymous_wish!')); }
        else { done(); }
      });
    })
    it('can be found by wish', function(done) {
      Wish.findOne({ wish: anonymous_wish.wish }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(tu.err('no wish found with _id ' + anonymous_wish._id)); }
        else if (result._id.toString() !== anonymous_wish._id.toString()) { done(tu.err('found a different wish from anonymous_wish!')); }
        else { done(); }
      });
    })
    it('should remove without error', function(done) {
      anonymous_wish.remove(done);
    })
    it('cannot be found by _id', function(done) {
      Wish.findOne({ _id: anonymous_wish._id }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(); }
        else if (result._id.toString() !== anonymous_wish._id.toString()) { done(); }
        else { done(tu.err('found anonymous_wish when it should have been removed!')); }
      });
    })
    it('cannot be found by wish', function(done) {
      Wish.findOne({ wish: anonymous_wish.wish }, function(err, result) {
        if (err) { done(err); }
        else if (! result) { done(); }
        else if (result._id.toString() !== anonymous_wish._id.toString()) { done(); }
        else { done(tu.err('found anonymous_wish when it should have been removed!')); }
      });
    })
  })*/
})