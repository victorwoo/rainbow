(function () {
  'use strict';
  angular.module('rainbowApp')
    .controller('MainCtrl', MainCtrl);

  function MainCtrl($scope, $http, Upload) {
    var vm = this;

    vm.awesomeThings = [];
    vm.upload = upload;
    vm.rainbowCount = 4;

    activate();

    ////////////////////////////////////////////

    /*jshint validthis: true*/
    function activate() {
      $http.get('/api/things').success(function (awesomeThings) {
        vm.awesomeThings = awesomeThings;
      });

      $scope.$watch('vm.files', function () {
        vm.upload(vm.files);
      });
    }

    function upload(files) {
      console.log(files);
      if (!(files && files.length)) {
        return;
      }

      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        Upload.upload({
          url: '/api/rainbow/uploads',
          fields: {rainbowCount: vm.rainbowCount},
          file: file
        }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
          console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
        });
      }
    }
  }
}());
