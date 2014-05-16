(function() {
var tagsModule = angular.module('tags', []);
tagsModule.factory('TagFactory', function($resource, $rootScope) {
  var Tag = $resource('/api/tag/:id', null,
                      { update: { method: 'PUT' } }
  );
  Tag.list = function(cb) {
    console.log('Tag.list called');
    if (_.isUndefined($rootScope.tags)) {
      $rootScope.tag_query = Tag.query(function(tags) {
        console.log('Tag.list cb');
        $rootScope.tags = tags;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        console.error(response.data.error);
        $rootScope.tag_error = response.data.error;
        $rootScope.tags = [];
        if (_.isFunction(cb)) { cb(); }
      });
    }
    else {
      if (_.isFunction(cb)) { cb(); }
    }
  };
  return Tag;
});

tagsModule.controller('ManageTagsCtrl', function($scope, TagFactory, $rootScope) {
  $scope.newTag = function() {
    delete $scope.tag_backup;
    delete $scope.tag_error;
    $scope.tag = new TagFactory();
  };

  $scope.activeTag = function(tag) {
    $scope.tag_backup = _.cloneDeep(tag);
    $scope.tag = tag;
  };

  $scope.revertTag = function() {
    _.forEach($rootScope.tags, function(tag, i) {
      if (tag._id === $scope.tag._id) {
        _.each($scope.tag_backup, function(val, key) {
          tag[key] = val;
        });
        return false; //break
      }
    });
    $scope.newTag();
  };

  $scope.__defineGetter__('editing_tag', function() {
    return (typeof $scope.tag_backup !== 'undefined');
  });

  $scope.saveTag = function(tag) {
    if (tag._id) {
      TagFactory.update({ id: tag._id }, tag, function(t) {
        console.log('successfully edited tag!', t);
        $scope.newTag();
      }, function(response) {
        console.error(response.data.error);
        $scope.tag_error = response.data.error;
      });
    }
    else {
      TagFactory.save(tag, function(t) {
        console.log('successfully added tag!', t);
        $rootScope.tags.push(t);
        $scope.newTag();
      }, function(response) {
        console.error(response.data.error);
        $scope.tag_error = response.data.error;
      });
    }
  };

  $scope.deleteTag = function(tag) {
    tag.$delete({ id: tag._id }, function(success) {
      console.log('successfully deleted tag!', tag);
      $rootScope.tags = _.reject($rootScope.tags, function(_tag) {
        return _tag.name === tag.name;
      });
    }, function(response) {
      console.error(response.data.error);
      $scope.tag_error = response.data.error;
    });
  };

  $scope.newTag();
});

tagsModule.controller('DisplayTagCtrl', function($scope, $rootScope, $routeParams, TagFactory, CategoryFactory, RecordFactory) {
  var tag_name = $routeParams.name
    , category_query = {};
  async.parallel([
    _.bind(TagFactory.list, TagFactory),
    _.bind(CategoryFactory.list, CategoryFactory)
  ], function() {
    console.log('lists returned.');
    if (! _.isEmpty(tag_name)) {
      $scope.tag = _.find($rootScope.tags, function(tag) {
        return tag.name === tag_name;
      });
      if (_.isObject($scope.tag)) {
        $scope.tag_categories = _.filter($rootScope.categories, function(category) {
          return _.contains(category.tags, $scope.tag._id);
        });
      }
      else {
        console.error('No tag found with name:', tag_name);
        $scope.tag_categories = $rootScope.categories;
      }
    }
    else {
      $scope.tag_categories = $rootScope.categories;
    }

    $rootScope.records = $rootScope.records || {};
    var category_ids = _.pluck($scope.tag_categories, '_id');
    console.log('about to query.');
    RecordFactory.query({ category_ids: category_ids,
                          day_range: [0, $rootScope.today] },
                        function(records) {
      console.log('successfully fetched records!', records);
      var records_by_category_id = _.groupBy(records, 'category')
        , category_records;
      _.each(category_ids, function(category_id) {
        category_records = records_by_category_id[category_id];
        if (_.isObject(category_records)) {
          $rootScope.records[category_id] = _.groupBy(category_records, 'day');
        }
        else {
         $rootScope.records[category_id] = {};
        }
      });
    }, function(response) {
      acb(response.data.error);
    });

    $scope.min_day = _.min($scope.tag_categories, 'start_day').start_day;
    console.log('$scope.min_day is', $scope.min_day);
  });
  
  $scope.createRecord = function(category_id, day) {
    var record = { category: category_id, day: day };
    RecordFactory.save(record, function(r) {
      console.log('successfully added record!', r);
      var records = $rootScope.records[record.category][day] || [];
      records.push(r);
      $rootScope.records[record.category][day] = records;
    }, function(response) {
      console.error(response.data.error);
      $scope.tag_error = response.data.error;
    });
  };

  $scope.deleteRecord = function(record) {
    record.$delete({ id: record._id }, function(success) {
      console.log('successfully deleted record!', record);
      $rootScope.records[record.category][record.day] = _.reject($rootScope.records[record.category][record.day], function(_record) {
        return _record._id === record._id;
      });
    }, function(response) {
      console.error(response.data.error);
      $scope.tag_error = response.data.error;
    });
  };

  $scope.getNumRecords = function(day) {
    var num_records = 0
      , category_records;
    _.each($scope.records, function(records_by_day, category_id) {
      category_records = records_by_day[day];
      if (_.isArray(category_records)) {
        num_records += category_records.length;
      }
    });
    return num_records;
  };
});

})();