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
    CategoryFactory.query(function(success) {
      console.log('success!', success);
      $scope.categories = success;
    }, function(error) {
      console.error('error!', error);
    });

    $scope.newCategory = function() {
      $scope.category = new CategoryFactory();
      $scope.editing = false;
    };

    $scope.activeCategory = function(category) {
      $scope.category = category;
      $scope.editing = true;
    };

    $scope.saveCategory = function(category) {
      console.log('saveCategory called with', category);
      if (category._id) {
        CategoryFactory.update({ id: category._id }, category, function(c) {
          console.log('successfully edited tag!', c);
        }, function(error) {
          console.error('error!', arguments);
        });
      }
      else {
        CategoryFactory.save(category, function(c) {
          console.log('successfully added category!', c);
          $scope.categories.push(c);
        }, function(error) {
          console.error('error!', arguments);
        });
      }
      $scope.newCategory();
    };

    $scope.deleteCategory = function(category) {
      category.$delete({ id: category._id }, function(success) {
        console.log('success!', arguments);
        $scope.categories = _.reject($scope.categories, function(_category) {
          return _category.name === category.name;
        });
      }, function(error) {
        console.error('error!', arguments);
      });
    };

    $scope.newCategory();

    // Tags
    TagFactory.query(function(success) {
      console.log('success!', success);
      $scope.tags = success;
    }, function(error) {
      console.error('error!', error);
    });

    $scope.newTag = function() {
      $scope.tag = new TagFactory();
      $scope.editing = false;
    };

    $scope.activeTag = function(tag) {
      $scope.tag = tag;
      $scope.editing = true;
    };

    $scope.saveTag = function(tag) {
      console.log('saveTag called with', tag);
      if (tag._id) {
        TagFactory.update({ id: tag._id }, tag, function(t) {
          console.log('successfully edited tag!', t);
        }, function(error) {
          console.error('error!', arguments);
        });
      }
      else {
        TagFactory.save(tag, function(t) {
          console.log('successfully added tag!', t);
          $scope.tags.push(t);
        }, function(error) {
          console.error('error!', arguments);
        });
      }
      $scope.newTag();
    };

    $scope.deleteTag = function(tag) {
      tag.$delete({ id: tag._id }, function(success) {
        console.log('success!', arguments);
        $scope.tags = _.reject($scope.tags, function(_tag) {
          return _tag.name === tag.name;
        });
      }, function(error) {
        console.error('error!', arguments);
      });
    };

    $scope.newTag();
  }
);