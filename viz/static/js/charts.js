


(charty = function makeGraphs(error, projectsJson, statesJson) {

    //Clean projectsJson data
    var donorschooseProjects = JSON.parse(projectsJson);
    var dateFormat = d3.time.format("%Y-%m-%d");
    var donation_json;
    var fields;

    for (var i = 0, len = donorschooseProjects.length; i < len; i++) {
        //donation_json = donorschooseProjects[i];
        donation_json = donorschooseProjects[i];
        fields = donation_json['fields'];
        fields["date_posted"] = dateFormat.parse(fields["date_posted"]);
        fields["date_posted"].setDate(1);
        fields["total_donations"] = +donation_json['fields']["total_donations"];
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

    timeChart
        .width(600)
        .height(160)
        .margins({top: 10, right: 10, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .elasticX(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);

    resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);

    povertyLevelChart
        //.width(100)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);

    usChart.width(1000)
        .height(330)
        .dimension(stateDim)
        .group(totalDonationsByState)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, max_state])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        })
        .projection(d3.geo.albersUsa()
                    .scale(600)
                    .translate([340, 150]))
        .title(function (p) {
            return "State: " + p["key"]
                    + "\n"
                    + "Total Donations: " + Math.round(p["value"]) + " $";
        });

    dc.renderAll();
});


queue()
    .defer(d3.json, "/viz/projects")
    .defer(d3.json, "/static/geojson/us-states.json")
    .await(charty);


//$( document ).ready(function() {
function rechart(){
    //on window resize, all chart objects
    var all_charts = jQuery(".chart-stage");
    var chart;
    var div_height = 0;
    var div_width  = 0;

    for (var i = 0, len = all_charts.length; i < len; i++) {

        chart = jQuery(all_charts[i]);

        var child_div = chart.children();

        div_width = child_div.width();
        div_height = child_div.height();

        var child_svg = child_div.children();

        child_svg.attr('width', div_width);
        child_svg.attr('height', div_height);
    }
    dc.renderAll();
};

jQuery(document).ready(function () {
    //$( window ).resize(function() {
    //    rechart();
    //});
});
//});