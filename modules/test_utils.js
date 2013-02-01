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
  //get test user/password information
    , db = require('./db')
    , test_user = db.TEST_USER
    , test_password = db.TEST_PASSWORD
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
      testGet: function(route, options) {
        _.defaults(options, {
          describe: true
        , code: 200
        , type: 'html'
        });

        if (options.describe) {
          describe(route, runTest);
        }
        else {
          runTest();
        }

        function runTest() {
          var redirect = options.redirect
            , code = redirect ? 302 : options.code
            , description = 'should respond with ' +
                'Content-Type ' + options.type +
                ((code) ? ', HTTP Code ' + code : '') +
                ((redirect) ? ', redirecting to ' + redirect : '')
            , response_text;
          it(description, function(done) {
            request(app)
              .get(route)
              .expect('Content-Type', new RegExp(options.type))
              .expect(code)
              .end(onResponse);

            function onResponse(err, res) {
              should.not.exist(err);
              response_text = res.text;
              should.exist(response_text);
              response_text.should.be.a('string');
              if (redirect) {
                res.header.location.should.equal(redirect);
              }
              done();
            };
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
        };
      }
    , testPost: function(route, args, options) {
        _.defaults(options, {
          describe: true
        , code: 200
        });

        if (options.describe) {
          describe(route, runTest);
        }
        else {
          runTest();
        }

        function runTest() {
          var redirect = options.redirect
            , code = redirect ? 302 : options.code
            , description = 'should respond with ' +
                ((code) ? ', HTTP Code ' + code : '') +
                ((redirect) ? ', redirecting to ' + redirect : '');
          it(description, function(done) {
            request(app)
              .post(route)
              .send(args)
              .expect(code)
              .end(onResponse);

            function onResponse(err, res) {
              should.not.exist(err);
              var response_text = res.text;
              should.exist(response_text);
              response_text.should.be.a('string');
              if (redirect) {
                res.header.location.should.equal(redirect);
              }
              done();
            };
          });
        };
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
    , testRemove: function(instanceOrWhere) {
        //test that the instance removes
        it('should remove without error', function(done) {
          if (_.isFunction(instanceOrWhere.remove)) {
            instanceOrWhere.remove(done);
          }
          else {
            model.remove(instanceOrWhere, done)
          }
        });
      }
    , testFind: function(where, expected) {
        var can_cannot = expected === null ? 'cannot' : 'can';
        it(can_cannot + ' be found using ' + inspect(where), function(done) {
          model.findOne(where, handleResult);
          
          function handleResult(err, result) {
            should.not.exist(err);
            if (_.isObject(result) && _.isObject(expected)) {
              //pass if the result matches the expected instance
              result.equals(expected).should.equal(true);
            }
            else if (_.isUndefined(expected)) {
              //pass if a result was found
              result.should.be.a('object');
            }
            else {
              //pass if result and expected are null
              should.equal(result, expected);
            }
            done();
          };
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