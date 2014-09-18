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
  }; // JavaScript key codes for each arrow
  return function(scope, element, attrs) {
    // translate from element attribute, e.g. click-on-arrow="left", to key code
    var key_code = directions_to_key_codes[attrs.clickOnArrow]
      // this handler will be called for all keydown and keypress events
      , handler = function(e) {
      if (e.which !== key_code) {
        return; // key pressed wasn't the one we want
      }
      if (element.is(':hidden')) {
        return; // link is hidden, meaning it shouldn't be clicked
      }
      var focused_tag_name = e.target.tagName.toUpperCase();
      if (focused_tag_name === 'INPUT' || focused_tag_name === 'TEXTAREA') {
        return; // user probably meant to navigate within the focused text box
      }
      $timeout(function() {
        element.click();
      });

      e.preventDefault();
    };
    // listen for all keydown and keypress events at the top level ($document)
    $document.bind('keydown keypress', handler);
    // unbind handler, since body persists beyond element
    scope.$on('$destroy', function() {
      $document.unbind('keydown keypress', handler);
    });
  };
});
})();