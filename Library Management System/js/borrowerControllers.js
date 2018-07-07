var app = angular.module("Controllers");

app.controller("borrowersCtrl", ['$scope', 'server', function($scope, server) {
    $scope.status = { "open": false };
    $scope.addBorrower = {
        "firstName": "",
        "lastName": "",
        "ssn1": "",
        "ssn2": "",
        "ssn3": "",
        "street": "",
        "city": "",
        "state": "",
        "phone1": "",
        "phone2": "",
        "phone3": ""
    };

    $scope.enableAdd = false;

    $scope.$watch('addBorrower', function() {
        $scope.enableAdd = true;
        for (var key in $scope.addBorrower) {
            if ($scope.addBorrower[key] == "") {
                $scope.enableAdd = false;
            }
        }
    }, true);

    $scope.add_borrower = function() {
        var name = $scope.addBorrower.firstName + " " + $scope.addBorrower.lastName;
        var address = $scope.addBorrower.street + "," + $scope.addBorrower.city + "," + $scope.addBorrower.state;
        var ssn = $scope.addBorrower.ssn1 + "-" + $scope.addBorrower.ssn2 + "-" + $scope.addBorrower.ssn3;
        var phone = parseInt($scope.addBorrower.phone1 + "" + $scope.addBorrower.phone2 + "" + $scope.addBorrower.phone3);
        var json = { "name": name, "address": address, "ssn": ssn, "phone": phone };
        server.addBorrower(json)
            .then(function(data) {
                $scope.error = "";
                $scope.success = data.data;
                $scope.displayBorrowers();

            }).catch(function(data) {
                $scope.success = "";
                $scope.error = data.data;
            })
    }

    $scope.borrowers = [];

    $scope.displayBorrowers = function() {
        server.getBorrowers().then(function(data) {
            $scope.borrowers = data.data;
            $scope.borrowers.forEach(function(borrower) {
                var phone = borrower.Phone;
                phone = "" + phone;
                phone = phone.split("");
                phone.splice(0, 0, "(");
                phone.splice(4, 0, ")");
                phone.splice(5, 0, " ");
                phone.splice(9, 0, "-");
                phone = phone.join("");
                borrower.Phone = phone;

            })
            $scope.totalItems = $scope.borrowers.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = 8;
        });
    };

    $scope.displayBorrowers();

    $scope.$watchGroup(["currentPage", "borrowers"], function() {
        setPagingData($scope.currentPage);
    });

    function setPagingData(page) {
        var pagedData = $scope.borrowers.slice(
            (page - 1) * $scope.itemsPerPage,
            page * $scope.itemsPerPage
        );
        $scope.borrowersPerPage = pagedData;
    }

    $scope.states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN",
        "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"
    ];

}]);
