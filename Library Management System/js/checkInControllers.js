var app = angular.module("Controllers");

app.controller("checkInCtrl", ['$scope', 'server', function($scope, server) {
    $scope.searchString = "";
    $scope.loans = [];
    $scope.searched = false;
    $scope.success = "";
    $scope.error = "";
    $scope.selected = false;
    $scope.log = function() {
        console.log($scope.loans);
    }

    $scope.checkInSearch = function(searchString, fromSearch) {
        var searchJson = { "searchString": searchString };

        server.checkInSearch(searchJson).then(function(data) {
            $scope.searched = true;
            $scope.loans = data.data;
            if (fromSearch) {
                $scope.error = "";
                $scope.success = "";
            }
            $scope.EnableDisableCheckIn();
            $scope.totalItems = $scope.loans.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 8;
        });
    };

    $scope.checkIn = function() {
        $scope.loansToCheckIn = [];
        $scope.loans.forEach(function(loan, index) {
            if (loan.isSelected) {
                $scope.loansToCheckIn.push(loan);
            }
        });
        $scope.loansToCheckIn.forEach(function(loan, index) {
            var json = { "loan_id": loan.Loan_id };
            server.checkIn(json)
                .then(function(data) {
                    if (index == $scope.loansToCheckIn.length - 1 && !$scope.error) {
                        $scope.success = "Checked in successfully";
                        $scope.checkInSearch($scope.searchString, false);
                    }
                })
                .catch(function(data) {
                    $scope.error += data.data + " ";
                })
        })
    }

    $scope.$watchGroup(["currentPage", "loans"], function() {
        setPagingData($scope.currentPage);
    });

    function setPagingData(page) {
        var pagedData = $scope.loans.slice(
            (page - 1) * $scope.itemsPerPage,
            page * $scope.itemsPerPage
        );
        $scope.loansPerPage = pagedData;
    }

    $scope.EnableDisableCheckIn = function() {
        $scope.selected = false;
        $scope.loans.forEach(function(loan, index) {
            if (loan.isSelected) {
                $scope.selected = true;
            }
        });
    }


}]);
