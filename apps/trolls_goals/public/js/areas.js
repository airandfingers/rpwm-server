(function() {
var areasModule = angular.module('areas', []);
areasModule.factory('AreaFactory', function($resource, $rootScope) {
  var Area = $resource('/api/area/:id', null,
                           { query: { method: 'GET', isArray: true, cache: true }
                           , update: { method: 'PUT' } }
  );
  Area.list = function(cb) {
    console.log('Area.list called');
    if (_.isUndefined($rootScope.areas)) {
      $rootScope.area_query = Area.query(function(areas) {
        console.log('Area.list cb');
        $rootScope.areas = areas;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        console.error(response.data.error);
        $rootScope.area_error = response.data.error;
        $rootScope.areas = [];
        if (_.isFunction(cb)) { cb(); }
      });
    }
    else {
      if (_.isFunction(cb)) { cb(); }
    }
  };
  return Area;
});

areasModule.controller('ManageAreasCtrl', function($scope, $route, AreaFactory, $rootScope) {
  AreaFactory.list();

  $scope.newArea = function() {
    delete $scope.area_backup;
    delete $scope.area_error;
    $scope.area = new AreaFactory();
    $scope.area.prompt_for_description = false;
    $scope.area.start_day = $rootScope.today;
  };

  $scope.activeArea = function(area) {
    $scope.area_backup = _.cloneDeep(area);
    $scope.area = area;
  };

  $scope.revertArea = function() {
    _.forEach($rootScope.areas, function(area, i) {
      if (area._id === $scope.area._id) {
        _.each($scope.area_backup, function(val, key) {
          area[key] = val;
        });
        return false; //break
      }
    });
    $scope.newArea();
  };

  $scope.__defineGetter__('editing_area', function() {
    return (typeof $scope.area_backup !== 'undefined');
  });

  $scope.areaDomainName = function(area) {
    var domain = _.find($rootScope.domains, { _id: area.domain });
    if (_.isEmpty(domain)) { return 'None'; }
    return domain.name;
  };

  $scope.saveArea = function(area) {
    if (area._id) {
      AreaFactory.update({ id: area._id }, area, function(c) {
        console.log('successfully edited domain!', c);
        $scope.newArea();
      }, function(response) {
        console.error(response.data.error);
        $scope.area_error = response.data.error;
      });
    }
    else {
      AreaFactory.save(area, function(c) {
        console.log('successfully added area!', c);
        $rootScope.areas.push(c);
        $scope.newArea();
      }, function(response) {
        console.error(response.data.error);
        $scope.area_error = response.data.error;
      });
    }
  };

  $scope.deleteArea = function(area) {
    area.$delete({ id: area._id }, function(success) {
      console.log('successfully deleted area!', area);
      $rootScope.areas = _.reject($rootScope.areas, function(_area) {
        return _area.name === area.name;
      });
    }, function(response) {
      console.error(response.data.error);
      $scope.area_error = response.data.error;
    });
  };

  $scope.newArea();
});
})();