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
        console.error(response.data.error);
        $rootScope.error = response.data.error;
      });
    }
    else {
      Area.save(area, function(a) {
        console.log('successfully added area!', a);
        $rootScope.areas.push(a);
        $rootScope.records[a._id] = {};
        $rootScope.calculateDomainAreaMap();
      }, function(response) {
        console.error(response.data.error);
        $rootScope.error = response.data.error;
      });
    }
    $rootScope.newArea();
  };

  $rootScope.deleteArea = function(area) {
    area.$delete({ id: area._id }, function(success) {
      console.log('successfully deleted area!', area);
      $rootScope.handleDeletedArea(area, true);
    }, function(response) {
      console.error(response.data.error);
      $rootScope.error = response.data.error;
    });
  };

  $rootScope.handleDeletedArea = function(area, recalculate) {
    $rootScope.areas = _.reject($rootScope.areas, function(_area) {
      return _area.name === area.name;
    });
    if (recalculate) { $rootScope.calculateDomainAreaMap(); }
  }

  var Area = $resource('/api/area/:id', null,
                           { query: { method: 'GET', isArray: true, cache: true }
                           , update: { method: 'PUT' } }
  );
  Area.list = function(cb) {
    console.log('Area.list called');
    if (_.isUndefined($rootScope.areas)) {
      Area.query(function(areas) {
        console.log('Area.list cb');
        $rootScope.areas = areas;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        console.error(response.data.error);
        $rootScope.error = response.data.error;
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