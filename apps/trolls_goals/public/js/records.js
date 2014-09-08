(function() {
var recordsModule = angular.module('records', []);
recordsModule.factory('RecordFactory', function($resource, $rootScope) {
  $rootScope.records = $rootScope.records || {};
  $rootScope.createRecord = $rootScope.createRecord || function(area_id, day) {
    var record = { area: area_id, day: day };
    Record.save(record, function(r) {
      console.log('successfully added record!', r);
      r.just_created = true;
      var records = $rootScope.records[record.area][day] || [];
      records.push(r);
      $rootScope.records[record.area][day] = records;
    }, function(response) {
      console.error(response.data.error);
      scope.domain_error = response.data.error;
    });
  };

  $rootScope.backupRecord = $rootScope.backupRecord || function(record) {
    record._backup = _.cloneDeep(record);
  };

  $rootScope.revertRecord = $rootScope.revertRecord || function(record) {
    _.each(record, function(val, key) {
      if (key !== '_backup') {
        record[key] = record._backup[key];
      }
    });
    delete record._backup;
  };

  $rootScope.saveRecord = $rootScope.saveRecord || function(record) {
    delete record._backup;
    Record.update({ id: record._id }, record, function(r) {
      console.log('successfully edited record!', r);
    }, function(response) {
      console.error(response.data.error);
      scope.domain_error = response.data.error;
    });
  };

  $rootScope.deleteRecord = $rootScope.deleteRecord || function(record) {
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

  $rootScope.getNumRecords = $rootScope.getNumRecords || function(domain_areas, day) {
    var area_ids = _.pluck(domain_areas, '_id')
      , num_records = 0
      , area_records;
    _.each($rootScope.records, function(records_by_day, area_id) {
      if (! _.contains(area_ids, area_id)) { return; }
      area_records = records_by_day[day];
      if (_.isArray(area_records)) {
        num_records += area_records.length;
      }
    });
    return num_records;
  };

  var Record = $resource('/api/record/:id', null,
                         { query: { method: 'GET', isArray: true,
                                            url: '/api/record/query' }
                         , update: { method: 'PUT' } }
  );
  return Record;
});

recordsModule.controller('DayCtrl', function($scope, $rootScope, $routeParams,
                                             DomainFactory, AreaFactory) {
  // set up domain_area_map if it hasn't been set up yet
  if (! _.isObject($rootScope.domain_area_map)) {
    async.parallel([
      _.bind(DomainFactory.list, DomainFactory),
      _.bind(AreaFactory.list, AreaFactory)
    ], function() {
      $rootScope.calculateDomainAreaMap();
    });
  }
  $scope.day = parseInt($routeParams.day) || $rootScope.today;
});

recordsModule.controller('WeekCtrl', function($scope, $rootScope, $routeParams,
                                             DomainFactory, AreaFactory) {
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