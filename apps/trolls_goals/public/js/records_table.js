(function() {
var recordsTableModule = angular.module('recordsTable', []);
recordsTableModule.directive('recordsTable', function($rootScope, RecordFactory) {
  return {
    restrict: 'E',
    scope: { domain_areas: '=domainAreas', firstDay: '@', lastDay: '@', records: '=',
             showHeader: '@', clickToAddRecordToFirstDay: '@', domain: '=', show_hidden: '=showHidden' },
    templateUrl: 'tmpl/records_table.html',

    link: function(scope, element, attrs) {
      attrs.$observe('domainAreas', function(domain_areas) {
        scope.area_ids = _.pluck(scope.domain_areas, '_id');
        // set scope.min_day to scope.firstDay or earliest area.start_day, whichever is >
        var min_start_day = _.min(scope.domain_areas, 'start_day').start_day;
        scope.min_day = scope.firstDay > min_start_day ? scope.firstDay : min_start_day;

        RecordFactory.query({ area_ids: scope.area_ids,
                              day_range: [scope.firstDay, scope.lastDay] },
                              function(records) {
          var records_by_area_id = _.groupBy(records, 'area')
            , area_records;
          console.log('successfully fetched', scope.domain.name, 'records!', records_by_area_id);
          _.each(scope.area_ids, function(area_id) {
            area_records = records_by_area_id[area_id];
            $rootScope.records[area_id] = $rootScope.records[area_id] || {};
            if (_.isObject(area_records)) {
              _.each(_.groupBy(area_records, 'day'), function(day_records, day) {
                $rootScope.records[area_id][day] = day_records;
              });
            }
          });
        }, function(response) {
          console.error(response.data.error);
          $rootScope.error = response.data.error;
        });
      });
    }
  }
});
})();