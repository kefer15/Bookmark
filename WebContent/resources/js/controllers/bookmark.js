'use strict';

angular.module('bookmark', [
	'ngResource',
	'ngCookies'
])

.constant('INSTANCE_URL', 'http://localhost:8081')
// Online https://df-bookmarks-test.enterprise.dreamfactory.com
// Kevin http://localhost
// Yuliana http://localhost:8081

.constant('APP_API_KEY', 'caf80a2fe1a2edc7425e23b840dee6dbe5e3592c5bcc7e472eda0af308d774fb')
// Online 24122c4f438ef83fee04c70375209ca1b5062d4d06a45fbeff8d16f3de3aceb8
// Yuliana caf80a2fe1a2edc7425e23b840dee6dbe5e3592c5bcc7e472eda0af308d774fb

.run([
  '$cookies', 'APP_API_KEY', '$http',

  function ($cookies, APP_API_KEY, $http) {
    $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
    $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
  }
])

// Config - configure application routes and settings
.config([ 
  '$httpProvider',
  
  function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
  }
])

// Executes a function everytime before sending any request.
.factory('httpInterceptor', [
  '$q', '$injector', 'INSTANCE_URL',

  function ($q, $injector, INSTANCE_URL) {
    return {
      request: function (config) {
        if (config.url.indexOf('/api/v2') > -1) {
        	config.url = INSTANCE_URL + config.url;
        };

        if (config.method.toLowerCase() === 'post' && config.url.indexOf('/api/v2/user/session') > -1) {
        	delete config.headers['X-DreamFactory-Session-Token'];
        }
        
        return config;
      },
      responseError: function (result) {
			console.log('Error: ' + result.data.error.message);

			return $q.reject(result);
      }
    }
  }
])

/* FACTORIES*/
.factory('Page', [
	'$resource',
	
	function ($resource) {
		return $resource('/api/v2/mongodb/_table/Page/:id', { id: '@id' }, {
			query: {
				method: 'GET',
				isArray: false
			},
			create: {
				method: 'POST'
			},
			update: {
				method: 'PUT'
			},
			remove: {
				method: 'DELETE'
			}
		});
	}
])
.factory('Section', [
	'$resource',
	
	function ($resource) {
		return $resource('/api/v2/mongodb/_table/Section/:id', { id: '@id' }, {
			query: {
				method: 'GET',
				isArray: false
			},
			create: {
				method: 'POST'
			},
			update: {
				method: 'PUT'
			},
			remove: {
				method: 'DELETE'
			}
		});
	}
])
.factory('Paragraph', [
	'$resource',
	
	function ($resource) {
		return $resource('/api/v2/mongodb/_table/Paragraph/:id', { id: '@id' }, {
			query: {
				method: 'GET',
				isArray: false
			},
			create: {
				method: 'POST'
			},
			update: {
				method: 'PUT'
			},
			remove: {
				method: 'DELETE'
			}
		});
	}
])
.factory('Bookmark', [
	'$resource',
	
	function ($resource) {
		return $resource('/api/v2/mongodb/_table/Bookmark/:id', { id: '@id' }, {
			query: {
				method: 'GET',
				isArray: false
			},
			create: {
				method: 'POST'
			},
			update: {
				method: 'PUT'
			},
			remove: {
				method: 'DELETE'
			}
		});
	}
])

/* CONTROLLERS */
.controller('bookmarkController', [
	'$scope', '$filter', '$q', 'Page', 'Section', 'Paragraph', 'Bookmark',
	function ($scope, $filter, $q, Page, Section, Paragraph, Bookmark) {
		//Default Page
		$scope.idPage = 'PAG001';
		$scope.page = {};
		
		// Get Page data
		var loadPage = function(idPage) {
			console.log('Getting Page data, id: ' + idPage);
			Page.query({id: idPage}).$promise.then(function (result) {
				console.log(JSON.stringify(result));
				$scope.page = result;
				$scope.page.sections = [];
				
				// Get Sections data
				var promiseArr = [];
		        $scope.page.section_list.forEach(function (obj, i) {
		            var promise = loadSection(obj, function(result){
		            	$scope.page.sections.push(result);
		            });
		            promiseArr.push(promise);
		        });
		        
		        $q.all(promiseArr).then(function(){
		            console.log("Continue here ...");
		        })
			});
		};
		
		var loadSection = function(idSection, callback) {
			console.log('Getting Section data, id: ' + idSection);
	        return Section.query({id : idSection}).$promise.then(function(result) {
	        	console.log(JSON.stringify(result));
	        	return callback(result);
	        });
		}
		
		loadPage($scope.idPage);
	}
]);