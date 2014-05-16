(function() {
var categoriesModule = angular.module('categories', []);
categoriesModule.factory('CategoryFactory', function($resource, $rootScope) {
  var Category = $resource('/api/category/:id', null,
                           { query: { method: 'GET', isArray: true, cache: true }
                           , update: { method: 'PUT' } }
  );
  Category.list = function(cb) {
    console.log('Category.list called');
    if (_.isUndefined($rootScope.categories)) {
      $rootScope.category_query = Category.query(function(categories) {
        console.log('Category.list cb');
        $rootScope.categories = categories;
        if (_.isFunction(cb)) { cb(); }
      }, function(response) {
        console.error(response.data.error);
        $rootScope.category_error = response.data.error;
        $rootScope.categories = [];
        if (_.isFunction(cb)) { cb(); }
      });
    }
    else {
      if (_.isFunction(cb)) { cb(); }
    }
  };
  return Category;
});

categoriesModule.controller('ManageCategoriesCtrl', function($scope, $route, CategoryFactory, $rootScope) {
  CategoryFactory.list();

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
    _.forEach($rootScope.categories, function(category, i) {
      if (category._id === $scope.category._id) {
        _.each($scope.category_backup, function(val, key) {
          category[key] = val;
        });
        return false; //break
      }
    });
    $scope.newCategory();
  };

  $scope.__defineGetter__('editing_category', function() {
    return (typeof $scope.category_backup !== 'undefined');
  });

  $scope.categoryTagNames = function(category) {
    var tags = _.filter($rootScope.tags, function(tag) {
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
        $rootScope.categories.push(c);
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
      $rootScope.categories = _.reject($rootScope.categories, function(_category) {
        return _category.name === category.name;
      });
    }, function(response) {
      console.error(response.data.error);
      $scope.category_error = response.data.error;
    });
  };

  $scope.newCategory();
});
})();