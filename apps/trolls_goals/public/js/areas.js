(function() {
var areasModule = angular.module('areas', []);
areasModule.factory('AreaFactory', function($resource, $rootScope) {
  // Define Area CRUD functions on $rootScope
  $rootScope.newArea = function() {
    $rootScope.new_area = new Area();
    $rootScope.new_area.prompt_for_details = false;
    $rootScope.new_area.hidden = false;
    $rootScope.new_area.start_day = $rootScope.today;
  };

  $rootScope.backupArea = function(area) {
    area._backup = _.cloneDeep(area);
  };

  $rootScope.revertArea = function(area) {
    _.each(area, function(val, key) {
      if (key !== '_backup') {
        area[key] = area._backup[key];
      }
    });
    delete area._backup;
    $rootScope.calculateDomainAreaMap();
  };

  $rootScope.saveArea = function(area) {
    if (area._id) {
      delete area._backup;
      Area.update({ id: area._id }, area, function(a) {
        console.log('successfully edited area!', a);
        $rootScope.calculateDomainAreaMap();
      }, function(response) {
        $rootScope.onError('updating an area', response.data.error);
      });
    }
    else {
      $rootScope.areas.push(area);
      $rootScope.calculateDomainAreaMap();
      Area.save(area, function(a) {
        console.log('successfully added area!', a);
        area._id = a._id;
        $rootScope.records[a._id] = {};
      }, function(response) {
        $rootScope.onError('creating an area', response.data.error);
        $rootScope.areas = _.without($rootScope.areas, area);
        $rootScope.calculateDomainAreaMap();
      });
    }
    $rootScope.newArea();
  };

  $rootScope.deleteArea = function(area) {
    $rootScope.handleDeletedArea(area, true);
    area.$delete({ id: area._id }, function(success) {
      console.log('successfully deleted area!', area);
    }, function(response) {
      $rootScope.onError('deleting an area', response.data.error);
      $rootScope.areas.push(area);
      $rootScope.calculateDomainAreaMap();
    });
  };

  $rootScope.handleDeletedArea = function(area, recalculate) {
    $rootScope.areas = _.reject($rootScope.areas, function(_area) {
      return _area.name === area.name;
    });
    if (recalculate) { $rootScope.calculateDomainAreaMap(); }
  };

  $rootScope.handleAddedArea = function(area, recalculate) {
    $rootScope.areas.push(area);
    if (recalculate) { $rootScope.calculateDomainAreaMap(); }
  };

  var Area = $resource('/api/area/:id', null,
                           { query: { method: 'GET', isArray: true, cache: true }
                           , update: { method: 'PUT' } }
  );
  Area.list = function(cb) {
    if (_.isUndefined($rootScope.areas)) {
      Area.query(function(areas) {
        $rootScope.areas = areas;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        $rootScope.onError('looking up areas', response.data.error);
        $rootScope.areas = [];
        if (_.isFunction(cb)) { cb(); }
      });
    }
    else {
      if (_.isFunction(cb)) { cb(); }
    }
  };

  $rootScope.newArea();
  return Area;
});

})();