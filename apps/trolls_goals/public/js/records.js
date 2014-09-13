(function() {
var recordsModule = angular.module('records', []);
recordsModule.factory('RecordFactory', function($resource, $rootScope) {
  $rootScope.records = $rootScope.records || {};
  $rootScope.createRecord = $rootScope.createRecord || function(area_id, day) {
    var record = new Record();
    record.area = area_id; 
    record.day = day;
    record.just_created = true;
    var records = $rootScope.records[area_id][day] || [];
    records.push(record);
    $rootScope.records[area_id][day] = records;
    Record.save(record, function(r) {
      console.log('successfully added record!', r);
      record._id = r._id;
    }, function(response) {
      $rootScope.onError('creating a record', response.data.error);
      // remove not-actually-created record
      var records = $rootScope.records[area_id][day];
      records = _.without(records, record);
      $rootScope.records[area_id][day] = records;
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
      $rootScope.onError('updating a record', response.data.error);
    });
  };

  $rootScope.deleteRecord = $rootScope.deleteRecord || function(record) {
    record.$delete({ id: record._id }, function(success) {
      console.log('successfully deleted record!', record);
      $rootScope.records[record.area][record.day] = _.reject($rootScope.records[record.area][record.day], function(_record) {
        return _record._id === record._id;
      });
    }, function(response) {
      $rootScope.onError('deleting a record', response.data.error);
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

})();