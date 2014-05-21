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

recordsModule.directive('recordsTable', function($rootScope, RecordFactory) {
  $rootScope.records = $rootScope.records || {};
  return {
    restrict: 'E',
    scope: { domainAreas: '@', today: '@' },
    templateUrl: 'tmpl/records_table.html',

    link: function(scope, element, attrs) {
      attrs.$observe('domainAreas', function(domain_areas) {
        if (_.isEmpty(domain_areas)) { return; }
        scope.domain_areas = JSON.parse(domain_areas);
        scope.area_ids = _.pluck(scope.domain_areas, '_id');
        scope.min_day = _.min(scope.domain_areas, 'start_day').start_day;

        RecordFactory.query({ area_ids: scope.area_ids,
                              day_range: [0, $rootScope.today] },
                            function(records) {
          console.log('successfully fetched records!', records);
          var records_by_area_id = _.groupBy(records, 'area')
            , area_records;
          _.each(scope.area_ids, function(area_id) {
            area_records = records_by_area_id[area_id];
            if (_.isObject(area_records)) {
              $rootScope.records[area_id] = _.groupBy(area_records, 'day');
            }
            else {
             $rootScope.records[area_id] = {};
            }
          });
        }, function(response) {
          acb(response.data.error);
        });
      });

      scope.createRecord = function(area_id, day) {
        var record = { area: area_id, day: day };
        RecordFactory.save(record, function(r) {
          console.log('successfully added record!', r);
          var records = $rootScope.records[record.area][day] || [];
          records.push(r);
          $rootScope.records[record.area][day] = records;
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.saveRecord = function(record) {
        RecordFactory.update({ id: record._id }, record, function(r) {
          console.log('successfully edited record!', r);
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.deleteRecord = function(record) {
        record.$delete({ id: record._id }, function(success) {
          console.log('successfully deleted record!', record);
          $rootScope.records[record.area][record.day] = _.reject($rootScope.records[record.area][record.day], function(_record) {
            return _record._id === record._id;
          });
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.revertRecord = function(record) {
        RecordFactory.get({ id: record._id }, function(r) {
          _.each(r, function(val, key) {
            record[key] = val;
          });
          console.log('successfully reverted record!', record);
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.getNumRecords = function(day) {
        var num_records = 0
          , area_records;
        _.each(scope.records, function(records_by_day, area_id) {
          area_records = records_by_day[day];
          if (_.isArray(area_records)) {
            num_records += area_records.length;
          }
        });
        return num_records;
      };

      scope.record_methods = {
        saveRecord: scope.saveRecord
      , deleteRecord: scope.deleteRecord
      , revertRecord: scope.revertRecord
      };
    }
  }
});
})();