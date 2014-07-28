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

directivesModule.directive('ngEnter', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(e) {
      if (e.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });

        e.preventDefault();
      }
    });
  };
});

directivesModule.directive('ngCtrlDelete', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(e) {
      if (e.which === 46 && e.ctrlKey) {
        scope.$apply(function () {
          scope.$eval(attrs.ngCtrlDelete);
        });

        e.preventDefault();
      }
    });
  };
});

directivesModule.directive('ngEscape', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(e) {
      if (e.which === 27) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEscape);
        });

        e.preventDefault();
      }
    });
  };
});

directivesModule.directive('clickOnArrow', function($document, $timeout) {
  var directions_to_key_codes = {
    left: 37
  , up: 38
  , right: 39
  , down: 40
  };
  return function(scope, element, attrs) {
    var key_code = directions_to_key_codes[attrs.clickOnArrow]
      , handler = function(e) {
      var tag_name = e.target.tagName.toUpperCase();
      if (tag_name === 'INPUT' || tag_name === 'TEXTAREA') {
        return;
      }
      if (e.which === key_code) {
        $timeout(function () {
          element.click();
        });

        e.preventDefault();
      }
    };
    $document.bind('keydown keypress', handler);
    // unbind handler, since body persists beyond element
    scope.$on('$destroy', function() {
      $document.unbind('keydown keypress', handler);
    });
  };
});
})();