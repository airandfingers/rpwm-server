(function() {
var recordsModule = angular.module('controllers', [])
  , initialize = function($rootScope, $http, DomainFactory, AreaFactory) {
  if (! _.isObject($rootScope.domain_area_map)) {
    async.parallel([
      _.bind(DomainFactory.list, DomainFactory),
      _.bind(AreaFactory.list, AreaFactory)
    ], function() {
      if (_.isEmpty($rootScope.domains) && _.isEmpty($rootScope.domains)) {
        $http({ method: 'GET', url: '/reset' })
          .success(function(data, status, headers, config) {
            _.each(data.domains, function(domain_obj) {
              $rootScope.domains.push(new DomainFactory(domain_obj));
            });
            _.each(data.areas, function(area_obj) {
              $rootScope.areas.push(new AreaFactory(area_obj));
            });
            $rootScope.calculateDomainAreaMap();
        })
          .error(function(data, status, headers, config) {
            $rootScope.onError('calling reset route', data);
        });
      }
      else {
        $rootScope.calculateDomainAreaMap();
      }
    });
  }
};
recordsModule.controller('DayCtrl', function($scope, $rootScope, $routeParams, $http,
                                             $location, DomainFactory, AreaFactory) {
  // redirect to today if day is missing from route
  if (! _.isString($routeParams.day)) {
    $location.path('/day/' + $rootScope.today);
    return;
  }

  initialize($rootScope, $http, DomainFactory, AreaFactory);
  
  $scope.day = parseInt($routeParams.day);
});

recordsModule.controller('WeekCtrl', function($scope, $rootScope, $routeParams, $http,
                                             $location, DomainFactory, AreaFactory) {
  if (! _.isString($routeParams.last_day)) {
    $location.path('/week/' + $rootScope.today);
    return;
  }

  initialize($rootScope, $http, DomainFactory, AreaFactory);

  $scope.last_day = parseInt($routeParams.last_day) || $rootScope.today;
});

})();