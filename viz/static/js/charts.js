
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

    for (var i = 0, len = donorschooseProjects.length; i < len; i++) {
        fields = donorschooseProjects[i]['fields'];
        datePosted = fields["date_posted"];
        datePosted = dateFormat.parse(datePosted);
        datePosted.setDate(1);
        fields["date_posted"] = datePosted;
        fields["total_donations"] = +fields["total_donations"];
        donorschooseProjects[i]['fields'] = fields;
    }

    //Create a Crossfilter instance
    var ndx = crossfilter(donorschooseProjects);

    //Define Dimensions
    var dateDim = ndx.dimension(function(d) {return d['fields']["date_posted"];});
    var resourceTypeDim = ndx.dimension(function(d) { return d['fields']["resource_type"]; });
    var povertyLevelDim = ndx.dimension(function(d) { return d['fields']["poverty_level"]; });
    var stateDim = ndx.dimension(function(d) { return d['fields']["school_state"]; });
    var totalDonationsDim  = ndx.dimension(function(d) { return d['fields']["total_donations"]; });


    //Calculate metrics
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var totalDonationsByState = stateDim.group().reduceSum(function(d) {
        return d['fields']["total_donations"];
    });

    var all = ndx.groupAll();
    var totalDonations = ndx.groupAll().reduceSum(function(d) {return d['fields']["total_donations"];});

    var max_state = totalDonationsByState.top(1)[0].value;

    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]['fields']["date_posted"];
    var maxDate = dateDim.top(1)[0]['fields']["date_posted"];

    //Charts
    var timeChart = dc.barChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var usChart = dc.geoChoroplethChart("#us-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){return d; })
        .group(all);

    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){return d; })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));

    var timeElement = document.getElementById("time-chart").parentElement;//'time-chart-container');
    timeChart
        .width(timeElement.clientWidth)
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

    timeChart.xAxis().ticks( Math.floor(timeElement.clientWidth/50) );//This has to be separate as 'ticks()' is fucky (doesn't return the object)


    var resElement = document.getElementById('resource-type-row-chart').parentElement;//''res-chart-container');
    resourceTypeChart
        .width(resElement.clientWidth)
        //.height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .elasticX(true)
        .xAxis().ticks(4);



    var povElement = document.getElementById('poverty-level-row-chart').parentElement;// 'pov-chart-container');
    povertyLevelChart
        .width(povElement.clientWidth)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .elasticX(true)
        .xAxis().ticks(2);

    var mapElement = document.getElementById('map-chart-container');
    usChart
        .width(mapElement.clientWidth)
        .height(350)
        .dimension(stateDim)
        .group(totalDonationsByState)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, max_state])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        })
        .projection(d3.geo.albersUsa()
                    .scale(600)
                    .translate([mapElement.clientWidth/2, mapElement.clientHeight/2]))
        .title(function (p) {
            return "State: " + p["key"]
                    + "\n"
                    + "Total Donations: " + Math.round(p["value"]) + " $";
        });

    dc.renderAll();

    resize_monitor.addListener( function(){
        timeChart.width( timeElement.clientWidth ).xAxis().ticks( Math.floor(timeElement.clientWidth/50) );
        resourceTypeChart.width( resElement.clientWidth ).xAxis().ticks(  Math.floor(resElement.clientWidth/35) );
        povertyLevelChart.width( povElement.clientWidth).xAxis().ticks(  Math.floor(povElement.clientWidth/50) );
    });
}

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

var resize_monitor = function(){
    var listeners = [];
    var timer = null;
    var callListeners = function(){
        for(var l in listeners){
            listeners[l]();
        }
        dc.renderAll();
        timer = null;
    };
    var doresize = function(){
        if( timer !== null ){
            clearTimeout(timer);
        }
        timer = setTimeout(callListeners,333);
    };
    window.onresize = doresize;
    return {
        addListener:function(listener){
            for(var l in listeners){
                if(listeners[l]==listener){
                    return;
                }
            }
            listeners.push(listener);
        },
        removeListener:function(index){
            //TODO: splice array at index
        }
    };
}();