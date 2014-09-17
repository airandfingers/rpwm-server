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
        $rootScope.onError('updating a domain', response.data.error);
      });
    }
    else {
      var domain_copy = _.clone(domain);
      domain._id = 'ffffffffffffffffffffffff'; // create a temporary ID
      $rootScope.domains.push(domain);
      $rootScope.calculateDomainAreaMap();
      Domain.save(domain_copy, function(d) {
        console.log('successfully added domain!', d);
        domain._id = d._id;
        $rootScope.calculateDomainAreaMap();
      }, function(response) {
        $rootScope.onError('creating a domain', response.data.error);
        $rootScope.domains = _.without($rootScope.domains, domain);
        $rootScope.calculateDomainAreaMap();
      });
    }
    $rootScope.newDomain();
  };

  $rootScope.deleteDomain = function(domain) {
    var deleted_areas = [];
    $rootScope.domains = _.reject($rootScope.domains, function(_domain) {
      return _domain.name === domain.name;
    });
    _.each($rootScope.domain_area_map[domain._id], function(area) {
      deleted_areas.push(area);
      $rootScope.handleDeletedArea(area, false);
    });
    $rootScope.calculateDomainAreaMap();
    domain.$delete({ id: domain._id }, function(success) {
      console.log('successfully deleted domain!', domain);
    }, function(response) {
      $rootScope.onError('deleting a domain', response.data.error);
      $rootScope.domains.push(domain);
      _.each(deleted_areas, function(area) {
        $rootScope.handleAddedArea(area, false);
      });
      $rootScope.calculateDomainAreaMap();
    });
  };

  var Domain = $resource('/api/domain/:id', null,
                      { update: { method: 'PUT' } }
  );
  Domain.list = function(cb) {
    if (_.isUndefined($rootScope.domains)) {
      Domain.query(function(domains) {
        $rootScope.domains = domains;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        $rootScope.onError('looking up domains', response.data.error);
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