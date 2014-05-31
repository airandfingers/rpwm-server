(function() {
var recordsModule = angular.module('records', []);
recordsModule.factory('RecordFactory', function($resource, $rootScope) {
  var Record = $resource('/api/record/:id', null,
                         { query: { method: 'GET', isArray: true,
                                            url: '/api/record/query' }
                         , update: { method: 'PUT' } }
  );
  return Record;
});

recordsModule.controller('DayCtrl', function($scope, $rootScope, $routeParams,
                                             DomainFactory, AreaFactory) {
  // set up domain_area_map if it hasn't been set up yet
  if (! _.isObject($rootScope.domain_area_map)) {
    async.parallel([
      _.bind(DomainFactory.list, DomainFactory),
      _.bind(AreaFactory.list, AreaFactory)
    ], function() {
      $rootScope.domain_area_map = _.groupBy($rootScope.areas, 'domain');
    });
  }
  $scope.day = parseInt($routeParams.day) || $rootScope.today;
});

recordsModule.controller('WeekCtrl', function($scope, $rootScope, $routeParams,
                                             DomainFactory, AreaFactory) {
  // set up domain_area_map if it hasn't been set up yet
  if (! _.isObject($rootScope.domain_area_map)) {
    async.parallel([
      _.bind(DomainFactory.list, DomainFactory),
      _.bind(AreaFactory.list, AreaFactory)
    ], function() {
      $rootScope.domain_area_map = _.groupBy($rootScope.areas, 'domain');
    });
  }
  $scope.last_day = parseInt($routeParams.last_day) || $rootScope.today;
});

})();