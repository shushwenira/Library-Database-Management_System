var app = angular.module("Controllers");

app.controller("libraryCtrl", ['$scope', 'server', '$uibModal', function($scope, server, $uibModal) {

    $scope.refreshFines = function() {
        server.refreshFines().then(function(data) {
            $scope.data = data.data;
            $uibModal.open({
                templateUrl: '../pages/refreshFinesModal.html',
                controller: 'refreshFinesModalInstanceCtrl',
                backdrop: 'static',
                keyboard: false,
                size: "sm",
                resolve: {
                    text: function() {
                        return $scope.data;
                    }
                }
            });
        });
    }
}]);

app.controller('refreshFinesModalInstanceCtrl', function($scope, $uibModalInstance, text) {

    $scope.text = text;

    $scope.ok = function() {
        $uibModalInstance.close($scope.text);
    };

});
