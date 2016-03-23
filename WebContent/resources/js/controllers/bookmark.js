'use strict';

angular.module('bookmark', [
	'ngResource',
	'ngCookies'
])

.constant('INSTANCE_URL', 'https://df-bookmarks-test.enterprise.dreamfactory.com')
// Online https://df-bookmarks-test.enterprise.dreamfactory.com
// Kevin http://localhost
// Yuliana http://localhost:8081

.constant('APP_API_KEY', '24122c4f438ef83fee04c70375209ca1b5062d4d06a45fbeff8d16f3de3aceb8')
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

.directive('validation', function() {
	return {
		require: 'ngModel',
	    link: function(scope, elm, attrs, ctrl) {
	    	if(attrs.valrequired ===  "true") {
	    		switch(attrs.valtype) {
					case "numeric" 	:	ctrl.$validators.validation = function(modelValue, viewValue) {
											if (ctrl.$isEmpty(modelValue))
								    			return false;
								    		
											return (!isNaN(Number(viewValue)));
										};
										break;
										
					case "text" 	: 	ctrl.$validators.validation = function(modelValue, viewValue) {
											if (ctrl.$isEmpty(modelValue))
								    			return false;
								    		
											return (angular.isString(viewValue));
										};
										break;
										
					case "boolean"	:	ctrl.$validators.validation = function(modelValue, viewValue) {
											if (ctrl.$isEmpty(modelValue))
								    			return false;
								    		
											return (viewValue == "true" || viewValue == "false");
										};
										break;
						
					case "date"		: 	ctrl.$validators.validation = function(modelValue, viewValue) {
											if (ctrl.$isEmpty(modelValue))
								    			return false;
											
											return (!isNaN(Date.parse(viewValue)));
										};
										break;
					
					case "list"		: 	ctrl.$validators.validation = function(modelValue, viewValue) {
											if (ctrl.$isEmpty(modelValue))
								    			return false;
											
											return angular.isArray(viewValue.split(","));
										};
										break;
		    	}
	    	}	    	
	    }
  };
})

/* CONTROLLERS */
.controller('bookmarkController', [
	'$scope', '$filter', '$q', '$log', '$window', 'Page', 'Section', 'Paragraph', 'Bookmark',
	function ($scope, $filter, $q, $log, $window, Page, Section, Paragraph, Bookmark) {
		//Default Page
		$scope.load = false;
		$scope.mode = false;
		$scope.idPage = 'PAG001';
		$scope.page = {};
		
		$scope.currentSectionId = '';
		$scope.currentParagraphId = '';
		$scope.currentBookmarkId = '';
		$scope.indexSection = -1;
		$scope.indexParagraph = -1;
		$scope.indexBookmark = -1;
		
		$scope.bookmarks = [];
		
		$scope.form = {
			_id : '',
			NAME : '',
			DEFAULT_VALUE : '',
			TYPE : '',
			enabled : true
		};
		
		var loadPage = function(callback) {
			Page.query({id: $scope.idPage}).$promise.then(function (result) {
				$scope.load = true;
				var page = result;
				page.sections = [];
				
				if(page.SECTION_LIST.length !== 0) {
					return page.SECTION_LIST.reduce(function (sequence, objSEC) {
			        	return sequence.then(function() {
			        		return Section.query({id : objSEC}).$promise;
			            })
			            .then(function (result) {	            	
		            		var section = result;
		            		section.paragraphs = [];
		            		
		            		if(section.PARAGRAPH_LIST.length !== 0) {
		            			return section.PARAGRAPH_LIST.reduce(function(sequence, objPAR) {
			            			return sequence.then(function() {
			            				return Paragraph.query({id: objPAR}).$promise;
			            			})
			            			.then(function(resultPAR) {
			            				var paragraph = resultPAR;
			            				paragraph.bookmarks = [];
			            				
			            				if(paragraph.BOOKMARK_LIST.length !== 0) {
			            					return paragraph.BOOKMARK_LIST.reduce(function(sequence, objBKM) {
				            					return sequence.then(function() {
				            						return Bookmark.query({id: objBKM}).$promise;
				            					})
				            					.then(function(resultBKM) {
			            							paragraph.bookmarks.push(resultBKM);
			            							return paragraph;
				            					});
				            				}, Promise.resolve());
			            				} else
			            					return paragraph;
				            		})
				            		.then(function(paragraph){		            			
				            			section.paragraphs.push(paragraph);
				            			return section;
				            		});
			            		}, Promise.resolve());
		            		} else
		            			return section;
			            })
	            		.then(function(section){
	            			$log.debug("Section " + section._id + " done!");
	            			page.sections.push(section);
	            			return page;
			            });
			        }, Promise.resolve());
				} else
					return page;		        
			})
			.then(function(page) {
        		$scope.page = page;
        		$scope.load = false;
        		callback();
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
			var mistake = [];
			
			for(var i = 0; i < $scope.page.sections.length; i++) {
				for(var j = 0; j < $scope.page.sections[i].paragraphs.length;j++) {
					for(var k = 0; k < $scope.page.sections[i].paragraphs[j].bookmarks.length; k++) {
						if($scope.page.sections[i].paragraphs[j].bookmarks[k] !== undefined) {
							var objBKM = $scope.page.sections[i].paragraphs[j].bookmarks[k];
							var bkm = {};
							bkm._id = objBKM._id;
							bkm.$set = {};
							bkm.$set.VALUE = objBKM.VALUE;
							bookmarks.push(bkm);
						}
					}
				}
			}
			
			Bookmark.update({resource: bookmarks}).$promise.then(function (response) {
				if(response.error === undefined) {			
					loadPage(function(){
						$log.debug('Bookmarks have been updated correctly.');
					});
				} else
					$log.error(response.error.message);
			});
		};
		
		$scope.showValues = function(){
			$scope.bookmarks = [];
			$scope.load = true;
			$scope.mode = true;
			
			$scope.page.sections.forEach(function (objSEC, iSEC) {
				objSEC.paragraphs.forEach(function (objPAR, iPAR) {
					objPAR.bookmarks.forEach(function (objBKM, iBKM) {
						$scope.bookmarks.push(objBKM);
					});					
				});
			});
			
			$scope.load = false;
		};
		
		$scope.goBack = function() {
			$scope.mode = false;
		};
	}
]);