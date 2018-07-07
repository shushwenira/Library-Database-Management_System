var app = angular.module("Services");

app.factory('server', ['$http', function($http) {

    var refreshFines = function() {
        return $http.get('/generate-fines');
    }

    var search = function(json) {
        return $http.post('/search', json);
    }

    var checkout = function(json) {
        return $http.post('/check-out', json);
    }

    var checkInSearch = function(json) {
        return $http.post('/check-in-search', json);
    }

    var checkIn = function(json) {
        return $http.post('/check-in', json);
    }

    var getBorrowers = function() {
        return $http.get('/all-borrowers');
    }

    var addBorrower = function(json) {
        return $http.post('/add-borrower', json);
    }

    var fetchFines = function(json) {
        return $http.post('/all-fines', json);
    }

    var searchFine = function(json) {
        return $http.post('/search-fine', json);
    }

    var showBorrowerFines = function(json) {
        return $http.post('/borrower-fines', json);
    }

    var makePayment = function(json) {
        return $http.post('/fine-payment', json);
    }

    return {
        refreshFines: refreshFines,
        search: search,
        checkout: checkout,
        checkInSearch: checkInSearch,
        checkIn: checkIn,
        getBorrowers: getBorrowers,
        addBorrower: addBorrower,
        fetchFines: fetchFines,
        searchFine: searchFine,
        showBorrowerFines: showBorrowerFines,
        makePayment: makePayment
    }

}]);