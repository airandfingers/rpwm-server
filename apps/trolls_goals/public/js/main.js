var app = angular.module('app', ['ng', 'ngRoute', 'ngResource',
  'ui.multiselect', 'ui.bootstrap.tpls', 'ui.bootstrap.tabs']);

app.factory('CategoryFactory', function($resource) {
  return $resource('/api/category/:id', null, { update: { method: 'PUT' } });
});

app.factory('TagFactory', function($resource) {
  return $resource('/api/tag/:id', null, { update: { method: 'PUT' } });
});

app.controller('MainCtrl', function($scope, $route, CategoryFactory, TagFactory) {
    // Categories
    CategoryFactory.query(function(categories) {
      $scope.categories = categories;
    }, function(response) {
      console.error(response.data.error);
      $scope.category_error = response.data.error;
    });

    $scope.newCategory = function() {
      delete $scope.category_backup;
      delete $scope.category_error;
      $scope.category = new CategoryFactory();
    };

    $scope.activeCategory = function(category) {
      $scope.category_backup = _.cloneDeep(category);
      $scope.category = category;
    };

    $scope.revertCategory = function() {
      _.forEach($scope.categories, function(category, i) {
        if (category._id === $scope.category._id) {
          _.each($scope.category_backup, function(val, key) {
            category[key] = val;
          });
          return false;
        }
      })
      $scope.newCategory();
    };

    $scope.__defineGetter__('editing_category', function() {
      return (typeof $scope.category_backup !== 'undefined');
    });

    $scope.categoryTagNames = function(category) {
      var tags = _.filter($scope.tags, function(tag) {
        return _.contains(category.tags, tag._id);
      }), tag_names = _.pluck(tags, 'name').join(', ');
      if (_.isEmpty(tag_names)) { tag_names = 'None'; }
      return tag_names;
    };

    $scope.saveCategory = function(category) {
      if (category._id) {
        CategoryFactory.update({ id: category._id }, category, function(c) {
          console.log('successfully edited tag!', c);
          $scope.newCategory();
        }, function(response) {
          console.error(response.data.error);
          $scope.category_error = response.data.error;
        });
      }
      else {
        CategoryFactory.save(category, function(c) {
          console.log('successfully added category!', c);
          $scope.categories.push(c);
          $scope.newCategory();
        }, function(response) {
          console.error(response.data.error);
          $scope.category_error = response.data.error;
        });
      }
    };

    $scope.deleteCategory = function(category) {
      category.$delete({ id: category._id }, function(success) {
        console.log('successfully deleted category!', category);
        $scope.categories = _.reject($scope.categories, function(_category) {
          return _category.name === category.name;
        });
      }, function(response) {
        console.error(response.data.error);
        $scope.category_error = response.data.error;
      });
    };

    $scope.newCategory();

    // Tags
    TagFactory.query(function(tags) {
      $scope.tags = tags;
    }, function(response) {
      console.error(response.data.error);
      $scope.tag_error = response.data.error;
    });

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
      _.forEach($scope.tags, function(tag, i) {
        if (tag._id === $scope.tag._id) {
          _.each($scope.tag_backup, function(val, key) {
            tag[key] = val;
          });
          return false;
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
          $scope.tags.push(t);
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
        $scope.tags = _.reject($scope.tags, function(_tag) {
          return _tag.name === tag.name;
        });
      }, function(response) {
        console.error(response.data.error);
        $scope.tag_error = response.data.error;
      });
    };

    $scope.newTag();
  }
);