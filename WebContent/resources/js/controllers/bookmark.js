'use strict';

angular.module('bookmark', [
	'ngResource',
	'ngCookies'
])

.constant('INSTANCE_URL', 'http://localhost')
// Online https://df-bookmarks-test.enterprise.dreamfactory.com
// Kevin http://localhost
// Yuliana http://localhost:8081

.constant('APP_API_KEY', '837d4c936a7d41830afd45690d8b2b164535f71b6fd694be6fc947105968b489')
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
		$scope.load = false;
		$scope.idPage = 'PAG001';
		$scope.page = {};
		
		$scope.currentSectionId = '';
		$scope.currentParagraphId = '';
		$scope.currentBookmarkId = '';
		$scope.indexSection = -1;
		$scope.indexParagraph = -1;
		$scope.indexBookmark = -1;
		
		$scope.bookmarks = {};
		
		$scope.form = {
			_id : '',
			NAME : '',
			DEFAULT_VALUE : '',
			TYPE : '',
			enabled : true
		};
		
		var loadPage = function(callback) {
			$scope.load = true;
			Page.query({id: $scope.idPage}).$promise.then(function (result) {
				$scope.page = result;
				$scope.page.sections = [];
				var sequence = Promise.resolve();
		        
				$scope.page.SECTION_LIST.forEach(function (objPAG, iPAG) {
		        	sequence = sequence.then(function() {
		        		return Section.query({id : objPAG}).$promise;
		            })
		            .then(function (result) {	            	
		            	$scope.$apply(function() {	
		            		var section = result;
		            		section.paragraphs = [];
		            		
		            		var sequencePAR = Promise.resolve();
		            		section.PARAGRAPH_LIST.forEach(function(objPAR, iPAR) {
		            			sequencePAR = sequencePAR.then(function() {
		            				return Paragraph.query({id: objPAR}).$promise;
		            			})
		            			.then(function(resultPAR) {
		            				var paragraph = resultPAR;
		            				paragraph.bookmarks = [];
		            				
		            				var sequenceBKM = Promise.resolve();
		            				paragraph.BOOKMARK_LIST.forEach(function(objBKM, iBKM) {
		            					sequenceBKM = sequenceBKM.then(function() {
		            						return Bookmark.query({id: objBKM}).$promise;
		            					})
		            					.then(function(resultBKM) {
		            						$scope.$apply(function() {
		            							paragraph.bookmarks.push(resultBKM);
		            						});
		            					});
		            				});
			            			section.paragraphs.push(resultPAR);
			            		});
		            		})
		            		$scope.page.sections.push(section);
		            		$scope.load = false;
		            		callback();
	            		});
		            });		        	
		        });				
			});	
		}
		
		loadPage(function(){});
		
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
						loadPage(function(){
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
					loadPage(function(){
						$log.debug('Bookmark has been updated correctly.');
					});
				} else
					$log.error(response.error.message);
			});
		};
		
		$scope.remove = function(){
			Bookmark.remove({id: $scope.currentBookmarkId}).$promise.then(function (response) {
				if(response.error === undefined) {			
					var currentParagraph = $scope.page.sections[$scope.indexSection].paragraphs[$scope.indexParagraph];
					var index = currentParagraph.BOOKMARK_LIST.indexOf(String($scope.currentBookmarkId));
					currentParagraph.BOOKMARK_LIST.splice(index, 1);
					delete currentParagraph.bookmarks;
				
					Paragraph.update({id : $scope.currentParagraphId}, currentParagraph).$promise.then(function (response) {
						loadPage(function(){
							$log.debug('Bookmark has been removed correctly.');
						});
					});
				} else
					$log.error(response.error.message);
			});
		};
		
		$scope.saveValues = function(){
			var bookmarks = [];
			var flag = true
			var mistake = [];
			
			for(var i = 0; i < $scope.page.sections.length && flag; i++) {
				for(var j = 0; j < $scope.page.sections[i].paragraphs.length && flag;j++) {
					for(var k = 0; k < $scope.page.sections[i].paragraphs[j].bookmarks.length && flag; k++) {
						if($scope.page.sections[i].paragraphs[j].bookmarks[k] !== undefined) {
							var objBKM = $scope.page.sections[i].paragraphs[j].bookmarks[k];
							var bkm = {};
							bkm._id = objBKM._id;
							bkm.$set = {};
							
							switch(objBKM.TYPE) {
								case "numeric" 	:	if(objBKM.VALUE && !isNaN(Number(objBKM.VALUE))){
														bkm.$set.VALUE = objBKM.VALUE;
														bookmarks.push(bkm);
													} else {
														flag = false;
														mistake.push(objBKM.VALUE);
														mistake.push(objBKM.NAME);
														mistake.push(objBKM.TYPE);
													}
													break;
													
								case "text" 	: 	if(objBKM.VALUE && angular.isString(objBKM.VALUE)) {
														bkm.$set.VALUE = objBKM.VALUE;
														bookmarks.push(bkm);
													} else {
														flag = false;
														mistake.push(objBKM.VALUE);
														mistake.push(objBKM.NAME);
														mistake.push(objBKM.TYPE);
													}
													break;
													
								case "boolean"	:	if(objBKM.VALUE && (objBKM.VALUE == "true" || objBKM.VALUE == "false")) {
														bkm.$set.VALUE = objBKM.VALUE;
														bookmarks.push(bkm);
													} else {
														flag = false;
														mistake.push(objBKM.VALUE);
														mistake.push(objBKM.NAME);
														mistake.push(objBKM.TYPE);
													}
													break;
													
								case "date"		: 	if(objBKM.VALUE && !isNaN(Date.parse(objBKM.VALUE))) {
														bkm.$set.VALUE = objBKM.VALUE;
														bookmarks.push(bkm);
													} else {
														flag = false;
														mistake.push(objBKM.VALUE);
														mistake.push(objBKM.NAME);
														mistake.push(objBKM.TYPE);
													}
													break;
													
								case "list"		: 	if(objBKM.VALUE && angular.isArray(objBKM.VALUE.split(","))) {
														bkm.$set.VALUE = objBKM.VALUE;
														bookmarks.push(bkm);
													} else {
														flag = false;
														mistake.push(objBKM.VALUE);
														mistake.push(objBKM.NAME);
														mistake.push(objBKM.TYPE);
													}
													break;						
							}
						}
					}
				}
			}
			
			if(flag) {
				Bookmark.update({resource: bookmarks}).$promise.then(function (response) {
					if(response.error === undefined) {			
						loadPage(function(){
							$log.debug('Bookmarks have been updated correctly.');
						});
					} else
						$log.error(response.error.message);
				});
			} else
				console.log("Value '" + mistake[0] + "' of bookmark '" + mistake[1] + "' is not a '" + mistake[2] + "' type");
		};
	}
]);