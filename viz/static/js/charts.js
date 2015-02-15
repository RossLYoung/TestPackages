queue()
    .defer(d3.json, "/viz/projects")
    .defer(d3.json, "/static/geojson/us-states.json")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {

    //Clean projectsJson data
    var donorschooseProjects = JSON.parse(projectsJson);
    var dateFormat = d3.time.format("%Y-%m-%d");
    var fields;
    var datePosted;

    var donorsSanitized = [];//removed extraneous 'fields' accessor
    for (var i = 0, len = donorschooseProjects.length; i < len; i++) {
        fields = donorschooseProjects[i]['fields'];
        datePosted = fields["date_posted"];
        datePosted = dateFormat.parse(datePosted);
        datePosted.setDate(1);
        fields["date_posted"] = datePosted;
        fields["total_donations"] = +fields["total_donations"];
        //donorschooseProjects[i]['fields'] = fields;
        donorsSanitized.push(fields);
    }

    //Create a Crossfilter instance
    //var ndx = crossfilter(donorschooseProjects);
    var xfilter = crossfilter(donorsSanitized);

    var xkeys = Object.keys(donorsSanitized[0]);
    var keyCount = xkeys.length;
    var keyIndex = 0;
    //var dimensionFunctions = [];
    var xfilterDims = [];
    var controller = jQuery("#dim-controller");
    for (; keyIndex < keyCount; keyIndex++) {
        //console.trace("key: " + xkeys[keyIndex] + "; val: " + donorsSanitized[0][xkeys[keyIndex]]);
        //dimensionFunctions.push( (function(){
        //    var index = keyIndex;
        //    return function(d){ return d[xkeys[index]]}
        //}()) );

        xfilterDims.push({
            name: xkeys[keyIndex], dimension: xfilter.dimension((function () {
                    //this function needs a closure around the index
                    var index = keyIndex;
                    return function (d) {
                        return d[xkeys[index]]
                    }
                }())
            )
        });

        //angular.element(controller).scope().addDimension(xkeys[keyIndex], xfilter.dimension((function () {
        //        //this function needs a closure around the index
        //        var index = keyIndex;
        //        return function (d) {
        //            return d[xkeys[index]]
        //        }
        //    }())
        //));
    }

    var scope = angular.element(controller).scope();
    scope.$apply(function () {
        scope.dimensions = xfilterDims;
    });


    //Define Dimensions
    var dateDim = xfilter.dimension(function (d) {
        return d["date_posted"];
    });
    var resourceTypeDim = xfilter.dimension(function (d) {
        return d["resource_type"];
    });
    var povertyLevelDim = xfilter.dimension(function (d) {
        return d["poverty_level"];
    });
    var stateDim = xfilter.dimension(function (d) {
        return d["school_state"];
    });
    var totalDonationsDim = xfilter.dimension(function (d) {
        return d["total_donations"];
    });


    //Calculate metrics
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d) {
        return d["total_donations"];
    });

    var all = xfilter.groupAll();
    var totalDonations = xfilter.groupAll().reduceSum(function (d) {
        return d["total_donations"];
    });

    var max_state = totalDonationsByState.top(1)[0].value;

    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

    //Charts
    var timeChart = dc.barChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var usChart = dc.geoChoroplethChart("#us-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);

    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));

    function getHeight(element) {
        return element.height() - parseInt(element.css('padding-top'), 10) - parseInt(element.css('padding-bottom'), 10);
    }

    function getWidth(element) {
        var w = element.width();
        var l = parseInt(element.css('padding-left'), 10);
        var r = parseInt(element.css('padding-right'), 10);
        return element.width() - parseInt(element.css('padding-left'), 10) - parseInt(element.css('padding-right'), 10);
    }

    //var timeElement = document.getElementById("time-chart").parentElement;//'time-chart-container');
    var timeElement = jQuery("#time-chart").parent();
    var timeW = timeElement.width();
    timeChart
        .width(timeW)
        //.width(timeElement.clientWidth)
        //.height(element.clientHeight)
        //.margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .elasticX(true)
        .yAxis().ticks(4)

    timeChart.xAxis().ticks(Math.floor(timeW / 50));//This has to be separate as 'ticks()' is fucky (doesn't return the object)


    //var resElement = document.getElementById('resource-type-row-chart').parentElement;//''res-chart-container');
    var resElement = jQuery("#resource-type-row-chart").parent();
    resourceTypeChart
        .width(resElement.width())
        //.height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .elasticX(true)
        .xAxis().ticks(4);

    //var povElement = document.getElementById('poverty-level-row-chart').parentElement;// 'pov-chart-container');
    var povElement = jQuery('#poverty-level-row-chart').parent();
    povertyLevelChart
        .width(povElement.width())
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .elasticX(true)
        .xAxis().ticks(2);

    //var mapElement = document.getElementById('map-chart-container');
    var mapElement = jQuery('#map-chart-container').parent();
    var mapWidth = mapElement.width();
    usChart
        .width(mapWidth)
        .height(350)
        .dimension(stateDim)
        .group(totalDonationsByState)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, max_state])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        })
        .projection(d3.geo.albersUsa()
            .scale(mapWidth)
            .translate([mapWidth / 2, mapElement.height() / 2]))
        .title(function (p) {
            return "State: " + p["key"]
                + "\n"
                + "Total Donations: " + Math.round(p["value"]) + " $";
        });

    dc.renderAll();

    resize_monitor.addListener(function () {
        var w = timeElement.width();
        timeChart.width(w).xAxis().ticks(Math.floor(w / 50));

        w = resElement.width();
        resourceTypeChart.width(w).xAxis().ticks(Math.floor(w / 35));

        w = povElement.width();
        povertyLevelChart.width(w).xAxis().ticks(Math.floor(w / 50));

        w = mapElement.width();
        usChart.width(w)
            .projection(d3.geo.albersUsa()
                .scale(w)
                .translate([w / 2, mapElement.height() / 2]));
    });

    //if( ChartTools.createToolsForm() ) {
    //    var dim = ChartTools.addDimension(dateDim, "Date");
    //    ChartTools.addGroup(dim, numProjectsByDate, "By Date");
    //
    //    ChartTools.addDimension(povertyLevelDim, "Poverty Level");
    //    ChartTools.addDimension(resourceTypeDim, "Resource Type");
    //    ChartTools.addDimension(totalDonationsDim, "Total Donations");
    //    ChartTools.addDimension(stateDim, "State");
    //    ChartTools.refresh();
    //
    //    ChartTools.selectDimension();
    //}
}

var ChartToolsApp = angular.module("ChartTools", [])
    .controller('DimensionController', function ($scope) {
        $scope.dimensions = [{name: "TEZ", dimension: null}];
        //$scope.addDimension = function(dim_name,dim){
        //    $scope.dimensions.push( {name:dim_name, dimension:dim} );
        //};

    });


angular.bootstrap(document, ['ChartTools']);

//var DC_Resizer = function(){
//   var timer = null;
//    var resize = function(){
//        var stages = document.getElementsByClassName("chart-stage");
//        var stage = null;
//        for( var i= 0,len=stages.length; i<len; i++ ){
//            stage = stages[i];
//            stage.children[0].children[0].setAttribute('width',stage.clientWidth);//width(stage.clientWidth);
//        }
//        //dc.redrawAll();
//        dc.renderAll();
//        //dc.rescale();
//        timer = null;
//    };
//    var doresize = function(){
//        if( timer !== null ){
//            clearTimeout(timer);
//        }
//        timer = setTimeout(resize,100);
//    };
//    window.onresize = doresize;
//    window.addEventListener('load', function(){
//        resize();
//    });
//    return this;
//}();

var ChartTools__ = function () {
    var dimensions = {};
    //var dimensionNames = [];//can't use an object/assoc as we need to loop over
    var dimensionGroups = {};
    var dimensionFilters = {};
    var form = null;
    var groupsDiv = null;
    var filtersDiv = null;

    function setGroups(dim) {
        groupsDiv.empty();
        var d = dimensions[dim];
        if (d) {
            var groups = dimensionGroups[dim];
            var keys = Object.keys(groups);
            for (var group in keys) {
                groupsDiv.append(jQuery(document.createElement("div")).text(keys[group]).attr("draggable", true));
            }
        }
    }

    function setDimension(dim) {
        setGroups(dim);
        //setFilters(dim);
    }

    function createForm() {
        form = jQuery("#chart-tools");
        groupsDiv = jQuery(".chart-tools-groups");
        filtersDiv = jQuery(".chart-tools-filters");
    };

    return {
        addDimension: function (dim, name) {
            //for( var i= 0,len=dimensions.length; i<len; i++ ){
            //    if(dimensions[i]===dim){
            //        return;
            //    }
            //}
            var d = dimensions[name];
            if (!d) {
                //dimensionNames.push(name);
                //dimensions.push(dim);
                dimensions[name] = dim;
                dimensionGroups[name] = {};
                dimensionFilters[name] = {};
                return name;
            }
            return null;
        },
        addFilter: function (dim, filter, filter_name) {
            //for( var i= 0,len=dimensions.length; i<len; i++ ){
            //    if(dimensions[i]===dim){
            //        dimensionFilters[i][filter_name] = filter;
            //        return;
            //    }
            //}
            var d = dimensions[dim];
            if (d) {
                dimensionFilters[dim][filter_name] = filter;
            }
        },
        addGroup: function (dim, group, group_name) {
            //for( var i= 0,len=dimensions.length; i<len; i++ ){
            //    if(dimensions[i]===dim){
            //        dimensionGroups[i][group_name] = group;
            //        return;
            //    }
            //}
            var d = dimensions[dim];
            if (d) {
                dimensionGroups[dim][group_name] = group;
            }
        },
        createToolsForm: function () {
            if (form === null) {
                createForm();
                return true;
            }
            return false;
        },
        refresh: function () {
            var opts = jQuery("#chart-tools-dimension-opts");// document.getElementById("chart-tools-dimension-opts");
            var element = null;
            opts.empty();
            var keys = Object.keys(dimensions);
            for (var dim in keys) {
                element = jQuery(document.createElement("option"));
                element.text(keys[dim]);
                opts.append(element);
            }
            jQuery("#chart-tools-dim-select").bind('change', function () {
                var clicked = $(this)
                    .find("option:selected") // get selected option
                    //.parent()   // get that option's optgroup
                    .text();   // get optgroup's label
                setDimension(clicked);
            });
        },
        selectDimension: function (dim) {
            setDimension(dim);
        },
        setDimensions: function (dims, names) {
            //TODO: check for array
            dimensions = dims;
        }
    };
}();

var resize_monitor = function () {
    var listeners = [];
    var timer = null;

    function callListeners() {
        for (var l in listeners) {
            listeners[l]();
        }
        dc.renderAll();
        timer = null;
    };
    function doresize() {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(callListeners, 333);
    };
    window.onresize = doresize;
    return {
        addListener: function (listener) {
            for (var l in listeners) {
                if (listeners[l] === listener) {
                    return;
                }
            }
            listeners.push(listener);
        },
        removeListener: function (index) {
            //TODO: splice array at index
        }
    };
}();