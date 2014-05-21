(function() {
var app = angular.module('app', ['ng', 'ngRoute', 'ngResource',
  'trollsGoalsFilters', 'areas', 'domains', 'records',
  'ui.bootstrap.tpls', 'ui.bootstrap.typeahead', 'custom.bootstrap']);

app.config(function($routeProvider, $customtooltipProvider) {
  $routeProvider
    .when('/', {
      redirectTo: '/manage_areas'
    })
    .when('/manage_areas', {
      templateUrl: 'tmpl/manage_areas.html',
      controller: 'ManageAreasCtrl'
    })
    .when('/manage_domains', {
      templateUrl: 'tmpl/manage_domains.html',
      controller: 'ManageDomainsCtrl'
    })
    /*.when('/area', {
        templateUrl: 'area.html',
        controller: 'AreaController'
    })*/
    .when('/domains/:name?', {
      templateUrl: 'tmpl/domain.html',
      controller: 'DomainCtrl'
    })
    .otherwise({ redirectTo: '/' });

  $customtooltipProvider.options({
    appendToBody: true
  });
});

app.run(function($rootScope, $location, DomainFactory) {
  DomainFactory.list();
  var now = new Date();
  now = now.getTime() - now.getTimezoneOffset() * 60000;
  $rootScope.today = Math.floor(now / 86400000) + 1;
});

app.directive('navlink', function($location) {
  return {
    restrict: 'E',
    scope: { href: '@', title: '@' },
    templateUrl: 'tmpl/navlink.html',

    link: function(scope, element, attrs) {
      scope.isActive = function() {
        return attrs.href === $location.path().substring(1);
      };
    }
  }
});
})();