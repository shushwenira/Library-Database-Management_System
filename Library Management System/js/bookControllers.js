var app = angular.module("Controllers");

app.controller('checkoutModalInstanceCtrl', function($scope, $uibModalInstance, book, server) {

    $scope.book = book;

    $scope.error = "";
    $scope.success = "";

    $scope.checkout = function(card_id) {
        var json = { "isbn": book.ISBN, "card_id": card_id }
        server.checkout(json)
            .then(function(data) {
                $scope.error = "";
                $scope.success = data.data;
                $scope.$parent.search($scope.$parent.searchString);
            })
            .catch(function(data) {
                $scope.success = "";
                $scope.error = data.data;
            });
    }


    $scope.cancel = function() {
        $uibModalInstance.close($scope.book);
    };

});

app.controller("booksCtrl", ['$scope', 'server', '$uibModal', function($scope, server, $uibModal) {

    $scope.searchString = "";
    $scope.books = [];
    $scope.searched = false;

    $scope.search = function(searchString) {
        var searchJson = { "searchString": searchString };


        server.search(searchJson).then(function(data) {
            $scope.searched = true;
            $scope.books = data.data;
            $scope.totalItems = $scope.books.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 8;
        });
    }

    $scope.$watchGroup(["currentPage", "books"], function() {
        setPagingData($scope.currentPage);
    });

    function setPagingData(page) {
        var pagedData = $scope.books.slice(
            (page - 1) * $scope.itemsPerPage,
            page * $scope.itemsPerPage
        );
        $scope.booksPerPage = pagedData;
    }

    $scope.checkout = function(book) {
        $uibModal.open({
            templateUrl: '../pages/checkoutModal.html',
            controller: 'checkoutModalInstanceCtrl',
            backdrop: 'static',
            keyboard: false,
            scope: $scope,
            resolve: {
                book: function() {
                    return book;
                }
            }
        });
    }


}]);