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
// Kevin 837d4c936a7d41830afd45690d8b2b164535f71b6fd694be6fc947105968b489
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
			return result;
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
	'$scope', '$filter', '$q', '$log', '$window', 'Page', 'Section', 'Paragraph', 'Bookmark',
	function ($scope, $filter, $q, $log, $window, Page, Section, Paragraph, Bookmark) {
		//Default Page
		$scope.idPage = 'PAG001';
		$scope.page = {};
		
		$scope.currentSectionId = '';
		$scope.currentParagraphId = '';
		$scope.currentBookmarkId = '';
		$scope.indexSection = -1;
		$scope.indexParagraph = -1;
		$scope.indexBookmark = -1;
		
		$scope.form = {
			_id : '',
			NAME : '',
			DEFAULT_VALUE : '',
			TYPE : '',
			enabled : true
		};
		
		// Get Page data
		var loadPage = function(idPage, callback) {
			return Page.query({id: idPage}).$promise.then(function (result) {
				//console.log('Getting Page data, id: ' + idPage);
				//console.log(JSON.stringify(result));
				$scope.page = result;
				$scope.page.sections = [];
				
				// Get Sections data
				var promiseArr = [];
		        $scope.page.SECTION_LIST.forEach(function (obj, i) {
		            var promise = loadSection(obj, function(result){
		            	$scope.page.sections.push(result);
		            });
		            promiseArr.push(promise);
		        });
		        
		        $q.all(promiseArr).then(function(){
		            //console.log(">>>>>>>>>> Continue page here ...");
		            return callback();
		        })
			});
		};

		var loadSection = function(idSection, callback) {
	        return Section.query({id : idSection}).$promise.then(function(result) {
	        	//console.log('Getting Section data, id: ' + idSection);
	        	//console.log(JSON.stringify(result));
	        	var section = result;
	        	section.paragraphs = [];
	        	
				// Get Paragraph data
				var promiseArr = [];
		        section.PARAGRAPH_LIST.forEach(function (obj, i) {
		            var promise = loadParagraph(obj, function(result){
		            	section.paragraphs.push(result);
		            });
		            promiseArr.push(promise);
		        });
		        
		        $q.all(promiseArr).then(function(){
		        	//console.log(">>>>>>>>>> Continue section here ...");
		            return callback(section);
		        })
	        });
		};
		
		var loadParagraph = function(idParagraph, callback) {
	        return Paragraph.query({id : idParagraph}).$promise.then(function(result) {
	        	//console.log('Getting Paragraph data, id: ' + idParagraph);
	        	//console.log(JSON.stringify(result));
	        	var paragraph = result;
	        	paragraph.bookmarks = [];
	        	
				// Get Bookmark data
				var promiseArr = [];
		        paragraph.BOOKMARK_LIST.forEach(function (obj, i) {
		            var promise = loadBookmark(obj, function(result){
		            	paragraph.bookmarks.push(result);
		            });
		            promiseArr.push(promise);
		        });
		        
		        $q.all(promiseArr).then(function(){
		        	//console.log(">>>>>>>>>> Continue paragraph here ...");
		            return callback(paragraph);
		        })
	        });
		};
		
		var loadBookmark = function(idBookmark, callback) {
	        return Bookmark.query({id : idBookmark}).$promise.then(function(result) {
	        	//console.log('Getting Bookmark data, id: ' + idBookmark);
	        	//console.log(">>>>>>>>>> Continue bookmark here ...");
	        	//console.log(JSON.stringify(result));
	        	return callback(result);
	        });
		};

		loadPage($scope.idPage, function(){
			//console.log(JSON.stringify($scope.page));
		});

		$scope.setCurrentAdd = function(idSection, idParagraph, indexSection, indexParagraph){
			$scope.currentSectionId = idSection;
			$scope.currentParagraphId = idParagraph;
			$scope.indexSection = indexSection;
			$scope.indexParagraph = indexParagraph;
			$scope.form = {
				_id : '',
				NAME : '',
				DEFAULT_VALUE : '',
				TYPE : '',
				ENABLED : true
			};
		};
		
		$scope.setCurrentEdit = function(idSection, idParagraph, idBookmark, indexSection, indexParagraph, indexBookmark){
			$scope.currentSectionId = idSection;
			$scope.currentParagraphId = idParagraph;
			$scope.currentBookmarkId = idBookmark;
			$scope.indexSection = indexSection;
			$scope.indexParagraph = indexParagraph;
			$scope.indexBookmark = indexBookmark;
			
			var currentBookmark = $scope.page.sections[$scope.indexSection].paragraphs[$scope.indexParagraph].bookmarks[$scope.indexBookmark];

			$scope.form = {
				_id : currentBookmark._id,
				NAME : currentBookmark.NAME,
				DEFAULT_VALUE : currentBookmark.DEFAULT_VALUE,
				TYPE : currentBookmark.TYPE,
				ENABLED : currentBookmark.ENABLED
			};
		};
		
		$scope.create = function(){
			Bookmark.create({resource : [$scope.form]}).$promise.then(function (response) {
				if(response.error === undefined) {			
					var currentParagraph = $scope.page.sections[$scope.indexSection].paragraphs[$scope.indexParagraph];
					currentParagraph.BOOKMARK_LIST.push($scope.form._id);
					delete currentParagraph.bookmarks;
				
					Paragraph.update({id : $scope.currentParagraphId}, currentParagraph).$promise.then(function (response) {
						loadPage($scope.idPage, function(){
							$log.debug('Bookmark has been inserted correctly.');
						});
					});
				} else
					$log.error(response.error.message);
			});
		};
		
		$scope.update = function(){
			Bookmark.update({id: $scope.currentBookmarkId} , $scope.form).$promise.then(function (response) {
				if(response.error === undefined) {			
					loadPage($scope.idPage, function(){
						$log.debug('Bookmark has been updated correctly.');
					});
				} else
					$log.error(response.error.message);
			});
		};
		
		/*$scope.remove = function(){
			Bookmark.remove({resource : [$scope.form]}).$promise.then(function (response) {
				if(response.error === undefined) {			
					var currentParagraph = $scope.page.sections[$scope.indexSection].paragraphs[$scope.indexParagraph];
					currentParagraph.BOOKMARK_LIST.push($scope.form._id);
					delete currentParagraph.bookmarks;
				
					Paragraph.update({id : $scope.currentParagraphId}, currentParagraph).$promise.then(function (response) {
						loadPage($scope.idPage, function(){
							$log.debug('Bookmark has been inserted correctly.');
						});
					});
				} else
					$log.error(response.error.message);
			});
		};*/
	}
]);