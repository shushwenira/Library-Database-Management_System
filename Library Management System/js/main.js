angular.module("Controllers", []);

angular.module("Services", []);

var app = angular.module("Library", ['Controllers', 'Services', 'ui.router', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'blockUI']);

app.config(['$stateProvider', '$urlRouterProvider', 'blockUIConfig', function($stateProvider, $urlRouterProvider, blockUIConfig){

	$stateProvider
	.state({
		name: "library",
		url: "/library",
		controller: "libraryCtrl",
		templateUrl: "../pages/library.html",
		abstract: true
	})
	.state({
		name: "library.books",
		url: "/books",
		controller: "booksCtrl",
		templateUrl: "../pages/books.html"
	})
	.state({
		name: "library.borrowers",
		url: "/borrowers",
		controller: "borrowersCtrl",
		templateUrl: "../pages/borrowers.html"
	})
	.state({
		name: "library.checkIn",
		url: "/checkIn",
		controller: "checkInCtrl",
		templateUrl: "../pages/checkIn.html"
	})
	.state({
		name: "library.fineManagement",
		url: "/fineManagement",
		controller: "fineManagementCtrl",
		templateUrl: "../pages/fineManagement.html"
	});

	$urlRouterProvider.otherwise('/library/books');

	blockUIConfig.message = "Loading..."

}]);

angular.element(function() {
	angular.bootstrap(document,['Library']);	
});