(function() {
var recordsModule = angular.module('controllers', []);
recordsModule.controller('DayCtrl', function($scope, $rootScope, $routeParams,
                                             $location, DomainFactory, AreaFactory) {
  // redirect to today if day is missing from route
  if (! _.isString($routeParams.day)) {
    $location.path('/day/' + $rootScope.today);
    return;
  }

  // set up domain_area_map if it hasn't been set up yet
  if (! _.isObject($rootScope.domain_area_map)) {
    async.parallel([
      _.bind(DomainFactory.list, DomainFactory),
      _.bind(AreaFactory.list, AreaFactory)
    ], function() {
      $rootScope.calculateDomainAreaMap();
    });
  }
  $scope.day = parseInt($routeParams.day);
});

recordsModule.controller('WeekCtrl', function($scope, $rootScope, $routeParams,
                                             $location, DomainFactory, AreaFactory) {
  if (! _.isString($routeParams.last_day)) {
    $location.path('/week/' + $rootScope.today);
    return;
  }
  // set up domain_area_map if it hasn't been set up yet
  if (! _.isObject($rootScope.domain_area_map)) {
    async.parallel([
      _.bind(DomainFactory.list, DomainFactory),
      _.bind(AreaFactory.list, AreaFactory)
    ], function() {
      $rootScope.calculateDomainAreaMap();
    });
  }
  $scope.last_day = parseInt($routeParams.last_day) || $rootScope.today;
});

})();