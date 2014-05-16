(function() {
var app = angular.module('app', ['ng', 'ngRoute', 'ngResource',
  'trollsGoalsFilters', 'categories', 'tags', 'records',
  'ui.multiselect', 'ui.bootstrap.tpls', 'ui.bootstrap.tabs']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      redirectTo: '/manage_categories'
    })
    .when('/manage_categories', {
      templateUrl: 'tmpl/manage_categories.html',
      controller: 'ManageCategoriesCtrl'
    })
    .when('/manage_tags', {
      templateUrl: 'tmpl/manage_tags.html',
      controller: 'ManageTagsCtrl'
    })
    /*.when('/category', {
        templateUrl: 'category.html',
        controller: 'CategoryController'
    })*/
    .when('/tags/:name?', {
      templateUrl: 'tmpl/tags.html',
      controller: 'DisplayTagCtrl'
    })
    .otherwise({ redirectTo: '/' });
});

app.run(function($rootScope, $location, TagFactory) {
  TagFactory.list();
  $rootScope.today = Math.floor(new Date().getTime() / 86400000);
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