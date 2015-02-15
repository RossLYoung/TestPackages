/**
 * Created by broostar on 14/02/15.
 */

var ChartToolsApp = angular.module("ChartTools", []);

ChartToolsApp.run(function ($rootScope, ChartData, XFilter) {
    console.trace("Running.");
    $rootScope.xfilters = [];

    ChartData.loadData( function(data){
        XFilter.createXFilter(data);
        $rootScope.xfilters.push( XFilter );
    });

});

ChartToolsApp.factory('XFilter', function(){
    var x_filter = null;
    var dimensions = [];
    var dimensionsByName = {};
    return {
        createXFilter: function(data){
            x_filter = crossfilter(data);

            var xkeys = Object.keys(data[0]);
            var keyCount = xkeys.length;
            var keyIndex = 0;
            var dimString = "";
            for (; keyIndex < keyCount; keyIndex++) {
                dimString = xkeys[keyIndex];
                dimString = dimString.replace(/[_-]/g,' ');//TODO: camel case also to spaced lowercase (or Capitalised Words)?
                //dimensions.push({
                //    name: dimString, dimension: x_filter.dimension((function () {
                //            //this function needs a closure around the index
                //            var index = keyIndex;
                //            return function (d) {
                //                return d[xkeys[index]]
                //            }
                //        }())
                //    )
                //});
                dimensionsByName[dimString] = {
                    name: dimString,
                    dimension: x_filter.dimension((function () {
                        //this function needs a closure around the index
                        var index = keyIndex;
                        return function (d) {
                            return d[xkeys[index]]
                        }
                    }())),
                    filters: [],
                    groups: []
                };
                dimensions.push(dimensionsByName[dimString]);
            }
            return x_filter;
        },
        createGroup: function(dimName, type, groupName){
            var dim = dimensionsByName[dimName];
            if( dim ) {
                if (!type) {
                    //var g = dim.dimension.group();
                    dim.groups.push( {name:groupName, group:dim.dimension.group()} );
                    //dimensionsByName[dimName] = dim;
                }
            }
        },
        getDimensions: function(){ return dimensions; },
        getDimensionByName: function(name){
            return dimensionsByName[name];
        },
        xfilter: function(){ return x_filter; }
    };
});

ChartToolsApp.directive('ngCharts', function(){
    return {
        restrict: 'AE',
        scope: {
            charts: '&'
        },
        controller: ['$scope', 'C3Charts', function( $scope, C3Charts ){
            $scope.charts = C3Charts.charts();
            //TODO create listener and add to charts service to recieve changes?
            //$scope.$watch('charts.length', function(newval){
            //    if(newval>0){
            //
            //    }
            //});
        }],
        template:   '<div class="chart-wrapper" ng-repeat="chart in charts">' +
                        '<div class="chart-title">' +
                            '{{ chart.title }}' +
                        '</div>' +
                        //'<div class="chart-stage">' +
                            '{{ chart.chart }}' +
                        //'</div>' +
                    '</div>',
        replace: true
        //compile: function(tElement, tAttrs){
        //    tElement.append(createElement());
        //
        //    //var newDirective = angular.element('<div d2></div>');
        //    //iElement.append(newDirective);
        //    //$compile(newDirective)($scope);
        //}
      }
});

ChartToolsApp.service('C3Charts', function(){
    var charts = [];

    this.charts = function(){
        return charts;
    };

    this.createBarChart = function(element, title, dim, group){
        //insert bootstrap div
        //get size of bootstrapped div and subtract padding etc.

        var chart = dc.barChart(element);
        chart
            .width(timeW)
            //.width(timeElement.clientWidth)
            //.height(element.clientHeight)
            //.margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(dim)
            .group(group)
            .transitionDuration(500)
            //.x(d3.time.scale().domain([minDate, maxDate]))
            .elasticY(true)
            .xAxisLabel("Year")
            .elasticX(true)
            .yAxis().ticks(4)

        chart.xAxis().ticks(Math.floor(timeW / 50));//This has to be separate as 'ticks()' is fucky (doesn't return the object)

        charts.push({title:title,chart:chart});
    }
});

ChartToolsApp.service('ChartData', ['$http','$q', function($http, $q){

    var donorsSanitized = [];
    var loadCallback = angular.noop;

    function success(data){
        var projectsJson = data[0];
        var statesJson = data[1];

        //Clean projectsJson data
        var donorschooseProjects = JSON.parse(projectsJson);
        var dateFormat = d3.time.format("%Y-%m-%d");
        var fields;
        var datePosted;

        for (var i = 0, len = donorschooseProjects.length; i < len; i++) {
            fields = donorschooseProjects[i]['fields'];//removed extraneous 'fields' accessor
            datePosted = fields["date_posted"];
            datePosted = dateFormat.parse(datePosted);
            datePosted.setDate(1);
            fields["date_posted"] = datePosted;
            fields["total_donations"] = +fields["total_donations"];
            donorsSanitized.push(fields);
        }

        loadCallback(donorsSanitized);
    }

    function fail(reason){
        var x = reason;
    }

    function notify(detail){
        var x = detail;
    }

    this.getData = function(){
        return donorsSanitized;
    };

    this.loadData = function (callback) {
        loadCallback = callback;

        var defProj = $q.defer();
        d3.json("/viz/projects", function(err, json){
            if (err) {
                defProj.reject();
            }

            defProj.resolve(json);
        });

        var defMaps = $q.defer();
        d3.json("/static/geojson/us-states.json", function(err, json){
            if(err){ defMaps.reject(); }

            defMaps.resolve(json);
        });

        $q.all( [defProj.promise,defMaps.promise] ).then(success, fail, notify);
    };
}]);

ChartToolsApp.controller('DimensionController', ["$scope","$rootScope", "$document", "C3Charts", function ($scope, $rootScope, $document, C3Charts) {
    $scope.xfilters = $rootScope.xfilters;
    $scope.dimensions = [];
    $scope.filters = [];
    $scope.groups = [];
    $scope.currentXFilter = null;
    $scope.currentDimension = null;

    $scope.$watch('xfilters.length', function (newval, oldval) {
        if (newval > 0) {
            $scope.currentXFilter = $scope.xfilters[newval-1];
            $scope.dimensions =  $scope.currentXFilter.getDimensions();
        }
    });

    $scope.selectedDim = 0;//this seems to give us a blank value for no selection...
    $scope.$watch('selectedDim', function(newval,oldval){
        //TODO show all the relevant filters and groups
        if(!newval){
            return;
        }
        $scope.currentDimension = $scope.currentXFilter.getDimensionByName(newval);
        $scope.filters = $scope.currentDimension.filters;//[];
        //angular.forEach($scope.currentDimension.filters,function(e){
        //    $scope.filters.push( e );
        //});
        $scope.groups = $scope.currentDimension.groups;//[];
        //angular.forEach($scope.currentDimension.groups,function(e){
        //    $scope.groups.push( e );
        //});
    });

    //$scope.$watch('groups.length', function(newval){
    //    if( newval ){
    //
    //    }
    //});

    $scope.addChart = function(){
        C3Charts.createBarChart(
            angular.element(document.createElement('div')).attr('class',"chart-stage")[0],
            "Charty chart",
            $scope.currentDimension,
            $scope.groups[0]
        );
    };

    $scope.addGroup = function(){
        $scope.currentXFilter.createGroup($scope.currentDimension.name, null, "test group");
        //$scope.currentDimension = $scope.currentXFilter.getDimensionByName($scope.currentDimension.name);
        //$scope.groups = $scope.currentDimension.groups;
    };

}]);


//angular.bootstrap(document, ['ChartTools']);