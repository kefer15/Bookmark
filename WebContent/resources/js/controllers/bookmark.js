'use strict';

angular.module('bookmark', [
	'ngResource',
	'ngCookies'
])

.constant('INSTANCE_URL', 'http://localhost')

.constant('APP_API_KEY', '837d4c936a7d41830afd45690d8b2b164535f71b6fd694be6fc947105968b489')

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
.factory('Bookmark', [
	'$resource',
	
	function ($resource) {
		return $resource('/api/v2/mongodb/_table/Element/:id', { id: '@id' }, {
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
	'$scope', '$filter', 'Bookmark',
	function ($scope, $filter, Bookmark) {
		
		$scope.colLabels = [ 'Pk Id' , 'Page View Id' , 'View Id' , 'Title' , 'Organization Id' , 'Visible Mobile' ,
		                     'General Model' , 'Last Changed By' , 'Last Changed Date' , 'Owner' , 'Puridiom View Id' ,
		                     'Page Type' , 'Sub Step' , 'View Group Id' , 'Full Browse' , 'Puridiom Process Id' ,
		                     'Document Type' , 'Enabled' ];
		console.log($scope.colLabels);
	}
]);