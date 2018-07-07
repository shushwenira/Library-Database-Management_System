var app = angular.module("Controllers");


app.controller("fineManagementCtrl", ['$scope', 'server', '$uibModal', function($scope, server, $uibModal) {
    $scope.includePaidFines = { "value": 1 };
    $scope.searched = false;
    $scope.fines = [];

    $scope.searchString = "";

    $scope.search = function() {
        if ($scope.searchString == "") {
            $scope.fetchAllFines();
        } else {
            var json = { "card_id": $scope.searchString, "includePaidFines": $scope.includePaidFines.value };
            server.searchFine(json)
                .then(function(data) {
                    $scope.searched = true;
                    $scope.fines = data.data;
                });
        }
    }

    $scope.fetchAllFines = function() {
        var json = { "includePaidFines": $scope.includePaidFines.value };
        server.fetchFines(json).then(function(data) {
            $scope.fines = data.data;
            $scope.searched = true;
            $scope.totalItems = $scope.fines.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 8;
        })
    };

    $scope.$watchGroup(["currentPage", "fines"], function() {
        setPagingData($scope.currentPage);
    });

    function setPagingData(page) {
        var pagedData = $scope.fines.slice(
            (page - 1) * $scope.itemsPerPage,
            page * $scope.itemsPerPage
        );
        $scope.finesPerPage = pagedData;
    }

    $scope.search();

    $scope.showFines = function(card_id) {
        $uibModal.open({
            templateUrl: '../pages/fineDisplayModal.html',
            controller: 'fineDisplayModalInstanceCtrl',
            backdrop: 'static',
            keyboard: false,
            scope: $scope,
            windowClass: 'finesModal',
            resolve: {
                card_id: function() {
                    return card_id;
                },
                includePaidFines: function() {
                    return $scope.includePaidFines.value;
                }
            }
        });
    }
}]);

app.controller('fineDisplayModalInstanceCtrl', function($scope, $uibModalInstance, card_id, includePaidFines, server) {

    $scope.card_id = card_id;
    $scope.includePaidFines = includePaidFines;

    $scope.error = "";
    $scope.success = "";
    $scope.loans = [];

    $scope.displayFines = function() {
        var json = { "card_id": $scope.card_id, "includePaidFines": $scope.includePaidFines }
        server.showBorrowerFines(json)
            .then(function(data) {
                $scope.loans = data.data;
            })
            .catch(function(data) {
                $scope.success = "";
                $scope.error = data.data;
            });
    }

    $scope.displayFines();

    $scope.makePayment = function(loan_id) {
        var json = { "loan_id": loan_id };
        server.makePayment(json)
            .then(function(data) {
                $scope.error = "";
                $scope.success = data.data;
                $scope.displayFines();
            })
            .catch(function(data) {
                $scope.error = data.data;
                $scope.success = "";
            })
    }


    $scope.cancel = function() {
        $uibModalInstance.close($scope.book);
    };

});