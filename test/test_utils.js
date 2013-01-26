module.exports = (function() {
  var _ = require('underscore')
    , util = require('util')
  //load chai assertion library
    , chai = require('chai')
    , should = chai.should()
    , Assertion = chai.Assertion;

  Assertion.addMethod('supersetOf', function(subset) {
    var obj = this._obj
      , result = {}
      
      , isSupersetOf = function(superset, subset, result) {
      return _.all(subset, function(subset_val, key) {
        var superset_val = superset[key];
        if (_.isObject(subset_val)) {
          if (_.isObject(superset_val)) {
            result[key] = {};
            //console.log('recursing for', key);
            return isSupersetOf(superset[key], subset_val, result[key]);
          }
          else {
            result[key] = superset_val;
            //console.log('superset doesn\'t have an object for', key);
            return false;
          }
        }
        else {
          result[key] = superset_val;
          //console.log(key, ': comparing', superset_val, 'to', subset_val);
          return superset_val === subset_val;
        }
      });
    }, match = isSupersetOf(obj, subset, result);

    this.assert(
      match
    , "expected #{this} to include #{exp} but got #{act}"
    , "expected #{this} to not include #{exp}"
    , subset     // expected
    , result     // actual
    );
  });

  var testModel = function(model, test_docs) {
    var schema = model.schema
      , model_name = model.modelName;

    describe('model', function() {
      it('should be a Function', function() {
        model.should.be.a('function');
      });
      
      it('should have a schema', function() {
        schema.should.be.a('object');
      });
    });

    _.each(test_docs, function(test_doc, i) {
      describe('instance #' + i, function() {
        //declare and initialize the instance
        var test_instance;
        before(function(done) {
          //remove any existing test documents
          model.remove(test_doc, function(err) {
            //create our instance from the test_doc
            test_instance = new model(test_doc);
            done(err);
          });
        });

        after(function(done) {
          //remove any existing test documents
          model.remove(test_doc, function(err) {
            done(err);
          });
        });
        //test that the instance saves
        //Note: this assumes test_doc is valid
        it('should save without error', function(done) {
          test_instance.save(done);
        });
        //test each path the schema defines
        schema.eachPath(function(path_name, schema_type) {
          describe('#' + path_name, function() {
            var value, match;
            beforeEach(function() {
              match = {};
            });
            //handle properties defined in test_doc
            if (_.has(test_doc, path_name)) {
              value = test_doc[path_name];
              it('should have a ' + path_name + ' property equal to ' + inspect(value), function() {
                test_instance.should.have.property(path_name);
                test_instance[path_name].should.equal(value);
              });
              it('can be found by ' + path_name, function(done) {
                match[path_name] = value;
                model.findOne(match, function(err, result) {
                  if (err) { done(err); }
                  else if (! result) { done(E('no ' + model_name + ' found')); }
                  else {
                    result.toObject().should.be.a.supersetOf(test_instance.toObject());
                    done();
                  }
                })
              });
            }
            //handle properties with default values
            else if (! _.isUndefined(schema_type.defaultValue)) {
              value = schema_type.defaultValue;
              if (_.isFunction(value)) {
                //defaultValue is a function - no way to know what value instance should have
                it('should have a ' + path_name + ' property', function() {
                  test_instance.should.have.property(path_name);
                });
              }
              else {
                //defaultValue is not a function - instance's value should equal defaultValue
                it('should have a ' + path_name + ' property equal to ', inspect(value), function() {
                  test_instance.should.have.property(path_name);
                  test_instance[path_name].should.equal(value);
                });
              }
            }
            //handle properties that will not be set
            else {
              it('should not have a ' + path_name + ' property', function() {
                test_instance.should.not.have.property(path_name);
              });
            }
          });
        });
        describe('#remove', function() {
          //test that the instance removes
          it('should remove without error', function(done) {
            test_instance.remove(done);
          });
          //test each path the schema defines
          schema.eachPath(function(path_name, schema_type) {
            var value, match;
            beforeEach(function() {
              match = {};
            });
            //handle properties defined in test_doc
            if (_.has(test_doc, path_name)) {
              describe('#' + path_name, function() {
                value = test_doc[path_name];
                it('cannot be found by ' + path_name, function(done) {
                  match[path_name] = value;
                  model.findOne(match, function(err, result) {
                    if (err) { done(err); }
                    else if (! result) { done(); }
                    else {
                      result.toObject().should.not.be.a.supersetOf(test_instance.toObject());
                      done();
                    }
                  })
                });
              });
            }
          });
        });
      });
    });
  }, E = function(error_message) {
    return new Error(error_message);
  }, inspect = function(obj) {
    return util.inspect(
      obj,    //the object to inspect
      false,  //show hidden (non-enumerable) properties?
      2,      //number of times to recurse
      true    //print in colors
    );
  }

  return {
    testModel: testModel
  , E: E
  , inspect: inspect
  };
})();