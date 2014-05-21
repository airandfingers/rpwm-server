(function() {
var domainsModule = angular.module('domains', []);
domainsModule.factory('DomainFactory', function($resource, $rootScope) {
  var Domain = $resource('/api/domain/:id', null,
                      { update: { method: 'PUT' } }
  );
  Domain.list = function(cb) {
    console.log('Domain.list called');
    if (_.isUndefined($rootScope.domains)) {
      $rootScope.domain_query = Domain.query(function(domains) {
        console.log('Domain.list cb');
        $rootScope.domains = domains;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        console.error(response.data.error);
        $rootScope.domain_error = response.data.error;
        $rootScope.domains = [];
        if (_.isFunction(cb)) { cb(); }
      });
    }
    else {
      if (_.isFunction(cb)) { cb(); }
    }
  };
  return Domain;
});

domainsModule.controller('ManageDomainsCtrl', function($scope, DomainFactory, $rootScope) {
  $scope.newDomain = function() {
    delete $scope.domain_backup;
    delete $scope.domain_error;
    $scope.domain = new DomainFactory();
  };

  $scope.activeDomain = function(domain) {
    $scope.domain_backup = _.cloneDeep(domain);
    $scope.domain = domain;
  };

  $scope.revertDomain = function() {
    _.forEach($rootScope.domains, function(domain, i) {
      if (domain._id === $scope.domain._id) {
        _.each($scope.domain_backup, function(val, key) {
          domain[key] = val;
        });
        return false; //break
      }
    });
    $scope.newDomain();
  };

  $scope.__defineGetter__('editing_domain', function() {
    return (typeof $scope.domain_backup !== 'undefined');
  });

  $scope.saveDomain = function(domain) {
    if (domain._id) {
      DomainFactory.update({ id: domain._id }, domain, function(t) {
        console.log('successfully edited domain!', t);
        $scope.newDomain();
      }, function(response) {
        console.error(response.data.error);
        $scope.domain_error = response.data.error;
      });
    }
    else {
      DomainFactory.save(domain, function(t) {
        console.log('successfully added domain!', t);
        $rootScope.domains.push(t);
        $scope.newDomain();
      }, function(response) {
        console.error(response.data.error);
        $scope.domain_error = response.data.error;
      });
    }
  };

  $scope.deleteDomain = function(domain) {
    domain.$delete({ id: domain._id }, function(success) {
      console.log('successfully deleted domain!', domain);
      $rootScope.domains = _.reject($rootScope.domains, function(_domain) {
        return _domain.name === domain.name;
      });
    }, function(response) {
      console.error(response.data.error);
      $scope.domain_error = response.data.error;
    });
  };

  $scope.newDomain();
});

domainsModule.controller('DomainCtrl', function($scope, $rootScope, $routeParams,
                         $http, DomainFactory, AreaFactory) {
  var domain_name = $routeParams.name
    , area_query = {};
  async.parallel([
    _.bind(DomainFactory.list, DomainFactory),
    _.bind(AreaFactory.list, AreaFactory)
  ], function() {
    console.log('lists returned.');
    if (! _.isEmpty(domain_name)) {
      $scope.domain = _.find($rootScope.domains, function(domain) {
        return domain.name === domain_name;
      });
      if (_.isObject($scope.domain)) {
        $scope.domain_area_map = {};
        $scope.domain_area_map[$scope.domain._id] = _.filter($rootScope.areas, { domain: $scope.domain._id });
      }
      else {
        console.error('No domain found with name:', domain_name);
        $scope.domain_area_map = _.groupBy($rootScope.areas, 'domain');
      }
    }
    else {
      $scope.domain_area_map = _.groupBy($rootScope.areas, 'domain');
    }
  });

  $scope.getDomain = function(domain_id) {
    return _.find($rootScope.domains, { _id: domain_id });
  };
});

})();