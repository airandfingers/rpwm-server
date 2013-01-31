module.exports = (function() {
  var _ = require('underscore')
    , util = require('util')
    , mongoose = require('mongoose')
    , express = require('express')
  //load supertest HTTP assertion library
    , request = require('supertest')
  //load chai assertion library
    , chai = require('chai')
    , should = chai.should()
    , starter_app_generator = function() {
      var app = express();
      app.set('view engine', 'ejs');
      app.use(express.bodyParser());
      app.set('base_url', 'ayoshitake.com');
      return app;
    }, Assertion = chai.Assertion;

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

  var AppTester = function(app) {
    return {
      testHtmlGet: function(route, options) {
        describe(route, function() {
          var content_type = options.type || 'html'
            , redirect = options.redirect
            , code = redirect ? 302 : 200
            , description = 'should respond with HTML, HTTP Code ' + code +
                ((redirect) ? ', redirecting to ' + redirect : '')
            , response_text;
          it(description, function(done) {
            request(app)
              .get(route)
              .expect('Content-Type', new RegExp(content_type))
              .expect(code)
              .end(function(err, res) {
                if (err) { done(err); }
                else {
                  response_text = res.text;
                  should.exist(response_text);
                  response_text.should.be.a('string');
                  if (redirect) {
                    response_text.should.match(new RegExp(
                      'Redirecting to ' + redirect
                    ));
                  }
                  done();
                }
              });
          });
          if (options.navbar === true) {
            it('should display the navbar', function() {
              should.exist(response_text);
              response_text.should.contain('<div class="navbar">');
            });
          }
          else if (options.navbar === false) {
            it('should not display the navbar', function() {
              should.exist(response_text);
              response_text.should.not.contain('<div class="navbar">');
            });
          }
          if (options.banner === true) {
            it('should display the banner', function() {
              should.exist(response_text);
              response_text.should.contain('<div class="banner">');
            });
          }
          else if (options.banner === false) {
            it('should not display the banner', function() {
              should.exist(response_text);
              response_text.should.not.contain('<div class="banner">');
            });
          }
        });
      }
    };
  };

  var ModelTester = function(model) {
    var model_name = model.modelName
      , schema = model.schema;
    return {
      testModel: function() {
        describe('model', function() {
          it('should be a function', function() {
            model.should.be.a('function');
          });
        });
      }
    , testSchema: function() {
        describe('schema', function() {
          it('should be a function', function() {
            schema.should.be.a('object');
          });
        })
      }
    , testProperties: function(instance, expected) {
        //test each path the schema defines
        schema.eachPath(function(path_name, schema_type) {
          var exp
            , act = instance.get(path_name);
          //handle properties defined in test_doc
          if (_.has(expected, path_name)) {
            exp = expected[path_name];
            it('should have a ' + path_name + ' property equal to ' + inspect(exp), function() {
              should.exist(act);
              act.should.equal(exp);
            });
          }
          //handle properties with default values
          else if (! _.isUndefined(schema_type.defaultValue)) {
            exp = schema_type.defaultValue;
            if (_.isFunction(exp)) {
              //defaultValue is a function - no way to know what exp instance should have
              it('should have a ' + path_name + ' property', function() {
                should.exist(act);
              });
            }
            else {
              //defaultValue is not a function - instance's value should equal defaultValue
              it('should have a ' + path_name + ' property equal to ', inspect(exp), function() {
                should.exist(act);
                act.should.equal(exp);
              });
            }
          }
          //handle properties that will not be set
          else {
            it('should not have a ' + path_name + ' property', function() {
              should.not.exist(act);
            });
          }
        });
      }
    , testSave: function(instance) {
        //test that the instance saves
        //Note: this assumes test_doc is valid
        it('should save without error', function(done) {
          instance.save(done);
        });
      }
    , testRemove: function(instance) {
        //test that the instance removes
        it('should remove without error', function(done) {
          instance.remove(done);
        });
      }
    , testFind: function(where, expected) {
        var can_cannot = expected ? 'can' : 'cannot';
        it(can_cannot + ' be found using ' + inspect(where), function(done) {
          model.findOne(where, function(err, result) {
            //console.log('found', result);
            if (err) { done(err); }
            else if (_.isObject(result) && _.isObject(expected)) {
              //pass if the result matches the expected instance
              result.equals(expected).should.equal(true);
              done();
            }
            else {
              //pass if the result is an exact match (e.g., null)
              //fail otherwise
              should.equal(result, expected);
              done();
            }
          });
        });
      }
    };
  }, E = function(error_message) {
    return new Error(error_message);
  }, inspect = function(obj) {
    return util.inspect(
      obj,    //the object to inspect
      false,  //show hidden (non-enumerable) properties?
      2,      //number of times to recurse
      true    //print in colors
    ).replace(/\n/g, '');
  }

  return {
    AppTester: AppTester
  , ModelTester: ModelTester
  , E: E
  , inspect: inspect
  , should: should
  , starter_app_generator: starter_app_generator
  };
})();