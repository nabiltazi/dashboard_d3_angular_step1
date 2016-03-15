'use strict';

/* Controllers */

var myApp = angular.module('myApp');

//AJOUT
myApp.controller('SalesController', function ($scope, $interval, $http, $log) {

    $scope.salesDataHTTP = [{ "hour": 1, "sales": 0 },
        { "hour": 2, "sales": 0 },
        { "hour": 3, "sales": 0 },
        { "hour": 4, "sales": 0 },
        { "hour": 5, "sales": 0 },
        { "hour": 6, "sales": 0 },
        { "hour": 7, "sales": 0 },
        { "hour": 8, "sales": 0 },
        { "hour": 9, "sales": 0 },
        { "hour": 10, "sales": 0 }];

    $interval(function () {

        $http.get('chart-data-api.json').then(function (response) {
            // your API would presumably be sending new data, not the same
            // data each time!
            $scope.salesDataHTTP = response.data;
        }, function (err) {
            throw err;
        });
        


        $scope.salesData = [{ "hour": 1, "sales": 54 },
            { "hour": 2, "sales": 66 },
            { "hour": 3, "sales": 77 },
            { "hour": 4, "sales": 70 },
            { "hour": 5, "sales": 60 },
            { "hour": 6, "sales": 63 },
            { "hour": 7, "sales": 55 },
            { "hour": 8, "sales": 47 },
            { "hour": 9, "sales": 55 },
            { "hour": 10, "sales": 30 }];


        //var hour=$scope.salesData.length+1;
        //var sales= Math.round(Math.random() * 100);
        //$scope.salesData.push({hour: hour, sales:sales});
    }, 300);
});
////


myApp.controller('MainCtrl', function ($scope, $http, $interval, $log) {

    $interval(function () {
        $http.get('donut-data-api.json').then(function (response) {
            // your API would presumably be sending new data, not the same
            // data each time!
            $scope.data = response.data
                .map(function (d) { return d * (1 - Math.random() / 2) });

        }, function (err) {
            throw err;
        });
    }, 300);
});


myApp.controller('ChatCtrl', function ($scope, socket, $log) {

    $scope.salesData = [{ "hour": 1, "sales": 54 },
        { "hour": 2, "sales": 66 },
        { "hour": 3, "sales": 77 },
        { "hour": 4, "sales": 70 },
        { "hour": 5, "sales": 60 },
        { "hour": 6, "sales": 63 },
        { "hour": 7, "sales": 55 },
        { "hour": 8, "sales": 47 },
        { "hour": 9, "sales": 55 },
        { "hour": 10, "sales": 30 }];
        
       

    // Socket listeners
    // ================

    socket.on('init', function (data) {
        $scope.name = data.name;
        $scope.users = data.users;
    });

    socket.on('send:message', function (message) {
        $scope.messages.push(message);
        var hour = $scope.salesData.length + 1;

        if (!isNaN(message.text)) {
            var value = parseInt(message.text);
            if (value >= 0)
                $scope.salesData.push({ "hour": hour, "sales": value });
        }

    });

    socket.on('change:name', function (data) {
        changeName(data.oldName, data.newName);
    });

    socket.on('user:join', function (data) {
        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + data.name + ' has joined.'
        });
        $scope.users.push(data.name);
    });

    // add a message to the conversation when a user disconnects or leaves the room
    socket.on('user:left', function (data) {
        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + data.name + ' has left.'
        });
        var i, user;
        for (i = 0; i < $scope.users.length; i++) {
            user = $scope.users[i];
            if (user === data.name) {
                $scope.users.splice(i, 1);
                break;
            }
        }
    });

    // Private helpers
    // ===============

    var changeName = function (oldName, newName) {
        // rename user in list of users
        var i;
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i] === oldName) {
                $scope.users[i] = newName;
            }
        }

        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + oldName + ' is now known as ' + newName + '.'
        });
    }

    // Methods published to the scope
    // ==============================

    $scope.changeName = function () {
        socket.emit('change:name', {
            name: $scope.newName
        }, function (result) {
            if (!result) {
                alert('There was an error changing your name');
            } else {

                changeName($scope.name, $scope.newName);

                $scope.name = $scope.newName;
                $scope.newName = '';
            }
        });
    };

    $scope.messages = [];

    $scope.sendMessage = function () {
        socket.emit('send:message', {
            message: $scope.message
        });



        // add the message to our model locally
        $scope.messages.push({
            user: $scope.name,
            text: $scope.message
        });

        // clear message box
        $scope.message = '';
    };


    $scope.saveToPc = function (data, filename) {

        if (!data) {
            console.error('No data');
            return;
        }

        if (!filename) {
            filename = 'download.json';
        }

        if (typeof data === 'object') {
            data = JSON.stringify(data, undefined, 2);
        }

        var blob = new Blob([data], { type: 'text/json' }),
            e = document.createEvent('MouseEvents'),
            a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initEvent('click', true, false, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    };
});