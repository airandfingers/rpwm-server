(function() {
var directivesModule = angular.module('trollsGoalsDirectives', []);

directivesModule.directive('navlink', function($location) {
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

directivesModule.directive('triggerClickOnLoad', function($timeout) {
  return function link(scope, element, attrs) {
    if (scope.record.just_created && scope.area.prompt_for_details) {
      $timeout(function() {
        element.triggerHandler('click');
      });
    }
  };
});

directivesModule.directive('focusOnLoad', function($timeout) {
  return function link(scope, element, attrs) {
    $timeout(function() {
      element[0].focus();
    });
  };
});

directivesModule.directive('focusNextWhenClicked', function($timeout) {
  return function link(scope, element, attrs) {
    element.addClass('clickable');
    element.bind('click', function(e) {
      element.next().focus();
    });
  };
});

directivesModule.directive('ngCtrlEnter', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13 && event.ctrlKey) {
        scope.$apply(function () {
            scope.$eval(attrs.ngCtrlEnter);
        });

        event.preventDefault();
      }
    });
  };
});

directivesModule.directive('ngCtrlDelete', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 46 && event.ctrlKey) {
        scope.$apply(function () {
            scope.$eval(attrs.ngCtrlDelete);
        });

        event.preventDefault();
      }
    });
  };
});

directivesModule.directive('ngEscape', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 27) {
        scope.$apply(function () {
            scope.$eval(attrs.ngEscape);
        });

        event.preventDefault();
      }
    });
  };
});
})();