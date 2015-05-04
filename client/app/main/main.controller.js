(function () {
  'use strict';
  angular.module('rainbowApp')
    .controller('MainCtrl', MainCtrl);

  function MainCtrl($scope, $http) {
    var vm = this;

    vm.awesomeThings = [];

    activate();

    ////////////////////////////////////////////

    /*jshint validthis: true*/
    function activate() {
      $http.get('/api/things').success(function (awesomeThings) {
        vm.awesomeThings = awesomeThings;
      });
    }
  }
}());
