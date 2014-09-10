(function() {
var domainsModule = angular.module('domains', []);
domainsModule.factory('DomainFactory', function($resource, $rootScope) {
  $rootScope.calculateDomainAreaMap = function() {
    $rootScope.domain_area_map = _.groupBy($rootScope.areas, 'domain');
    _.each($rootScope.domains, function(domain) {
      if (_.isUndefined($rootScope.domain_area_map[domain._id])) {
        $rootScope.domain_area_map[domain._id] = [];
      }
    });
  };
  // Define Domain CRUD functions on $rootScope
  $rootScope.newDomain = function() {
    $rootScope.new_domain = new Domain();
    $rootScope.new_domain.hidden = false;
  };

  $rootScope.getDomain = function(domain_id) {
    return _.find($rootScope.domains, { _id: domain_id });
  };

  $rootScope.backupDomain = function(domain) {
    domain._backup = _.cloneDeep(domain);
  };

  $rootScope.revertDomain = function(domain) {
    _.each(domain, function(val, key) {
      if (key !== '_backup') {
        domain[key] = domain._backup[key];
      }
    });
    delete domain._backup;
    $rootScope.calculateDomainAreaMap();
  };

  $rootScope.saveDomain = function(domain) {
    if (domain._id) {
      delete domain._backup;
      Domain.update({ id: domain._id }, domain, function(d) {
        console.log('successfully edited domain!', d);
        $rootScope.calculateDomainAreaMap();
      }, function(response) {
        console.error(response.data.error);
        $rootScope.error = response.data.error;
      });
    }
    else {
      Domain.save(domain, function(d) {
        console.log('successfully added domain!', d);
        $rootScope.domains.push(d);
        $rootScope.calculateDomainAreaMap();
      }, function(response) {
        console.error(response.data.error);
        $rootScope.error = response.data.error;
      });
    }
    $rootScope.newDomain();
  };

  $rootScope.deleteDomain = function(domain) {
    domain.$delete({ id: domain._id }, function(success) {
      console.log('successfully deleted domain!', domain);
      $rootScope.domains = _.reject($rootScope.domains, function(_domain) {
        return _domain.name === domain.name;
      });
      _.each($rootScope.domain_area_map[domain._id], function(area) {
        $rootScope.handleDeletedArea(area, false);
      });
      $rootScope.calculateDomainAreaMap();
    }, function(response) {
      console.error(response.data.error);
      $rootScope.error = response.data.error;
    });
  };

  var Domain = $resource('/api/domain/:id', null,
                      { update: { method: 'PUT' } }
  );
  Domain.list = function(cb) {
    console.log('Domain.list called');
    if (_.isUndefined($rootScope.domains)) {
      Domain.query(function(domains) {
        console.log('Domain.list cb');
        $rootScope.domains = domains;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        console.error(response.data.error);
        $rootScope.error = response.data.error;
        $rootScope.domains = [];
        if (_.isFunction(cb)) { cb(); }
      });
    }
    else {
      if (_.isFunction(cb)) { cb(); }
    }
  };

  $rootScope.newDomain();
  return Domain;
});

})();