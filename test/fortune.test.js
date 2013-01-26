//test boilerplate
var tu = require('./test_utils')
//modules being tested
  , db = require('../modules/db')
  , Fortune = require('../apps/fortune_cookie/fortune');

describe('Fortune', function() {
  var fortune_doc = {
    fortune: 'test fortune'
  }, fortune_docs = [fortune_doc];
  tu.testModel(Fortune, fortune_docs);
});