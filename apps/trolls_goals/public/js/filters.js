(function() {
var module = angular.module('trollsGoalsFilters', []);

module.filter('dayToDate', function() {
  return function(day) {
    var timestamp = day * 86400000 // multiply by ms/day
      , date = new Date(timestamp);
    return date;
  };
});

module.filter('dateFormat', function($filter) {
  var angularDateFilter = $filter('date');
  return function(date) {
    return angularDateFilter(date, 'EEEE M.d'); // Long form: MMMM d, yyyy https://github.com/angular/angular.js/blob/master/src/ng/filter/filters.js
  };
});

module.filter('makeRange', function() {
  return function(input) {
    var low_bound = parseInt(input[0])
      , high_bound = parseInt(input[1]);
    if (_.isNaN(low_bound)) {
      low_bound = 0;
    }
    if (_.isNaN(high_bound)) {
      high_bound = 0;
    }
    return _.range(low_bound, high_bound + 1);
  };
});
})();