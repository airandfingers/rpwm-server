(function() {
var recordsModule = angular.module('records', []);
recordsModule.factory('RecordFactory', function($resource, $rootScope) {
  var Record = $resource('/api/record/:id', null,
                         { query: { method: 'GET', isArray: true,
                                            url: '/api/record/query' } },
                         { update: { method: 'PUT' } }
  );
  return Record;
});
})();