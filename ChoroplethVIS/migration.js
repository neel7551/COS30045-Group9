function init() {
    document.getElementById("year_select").value = _year_;
    geomap("data/" + _year_ + ".csv");
}

function geomap(migrationPopulation) {

    var w = 1000;
    var h = 800;

    var projection = d3.geoMercator()
        .center([40, 25])
        .translate([w / 2.5, h / 2])
        .scale(400);

    var path = d3.geoPath().projection(projection);

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);

    svg.call(zoom);

    function zoomed(event) {
        if (!event) return; // check if event is defined
            svg.selectAll('path')
            .attr('transform', event.transform);
    }

    d3.csv(migrationPopulation).then(function (data) {

        console.log(data);
        var color = d3.scaleThreshold()
            .domain([
                0,
                30000,
                60000,
                120000,
                240000,
                480000,
                960000,
                d3.max(data, function (d) { return d.total; })
            ])
            .range(d3.schemeBlues[8]);

        legend_labels = ["< 30000", "30000 - 60000", "60000 - 120000", "120000 - 240000", "240000 - 480000", "480000 - 960000", "960000 >"];

        var legend = svg.selectAll(".map-legend")
            .data([0, 30000, 60000, 120000, 240000, 480000, 960000])
            .enter()
            .append("g")
            .attr("class", "legend");

        var ls_w = 20, ls_h = 20;

        //makes legend colour blocks
        legend.append("rect")
            .attr("x", w / 1.3)
            .attr("y", function (d, i) { return 250 - (i * ls_h) - 2 * ls_h; })
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d, i) { return color(d); });
        
        //legend label
        legend.append("text")
            .attr("x", w / 1.3)
            .attr("y", 70)
            .text("Legend: Total Yearly Migrators");
        
        svg.append("text")
            .attr("x", w / 1.25)
            .attr("y", 246)
            .attr("id","undefined")
            .attr("font-weight", "normal")
            .text("No Data Recorded");

        legend.append("rect")
            .attr("x", 769.5)
            .attr("y", 230)
            .attr("width", ls_w - 1)
            .attr("height", ls_h)
            .style("fill", "#ccc");


        legend.append("text")
            .attr("x", w / 1.25)
            .attr("y", function (d, i) { return 250 - (i * ls_h) - ls_h - 4; })
            .text(function (d, i) { return legend_labels[i]; });


        d3.json("data/countries.geojson").then(function (json) {
            console.log(json)
            for (var i = 0; i < data.length; i++) {
                var dataState = data[i].country;

                var dataValue = parseFloat(data[i].total);

                for (var j = 0; j < json.features.length; j++) {
                    //the line below is d.properties.C_name
                    var jsonState = json.features[j].properties.C_name;

                    if (dataState == jsonState) {
                        //the line below is d.properties.value
                        json.features[j].properties.value = dataValue;
                        break;
                    }
                }
            }

            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("stroke-width", 0.25)
                .attr("stroke", "black")
                .attr("d", path)
                .style("opacity", 0.75)
                .on("mouseover", function (event, d) // Add 'd' as a parameter to the function
                { 
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 1);
                    
                    tooltip.html(function () //displays data in tooltip
                    {
                        let C_name = d.properties.C_name; // Use the 'd' parameter to get the data of the current path element
                        let total = d.properties.value;
                        if (C_name && total) {
                            return C_name + "<br>Total: " + total;
                        } else if (C_name && !total) {
                            return C_name + "<br>No data recorded";
                        } else {
                            return "No data available!";
                        }
                    })
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px")
                   
                    //hover opacity and red outline
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("stroke", "red")
                        .attr("stroke-width", 1.5)
                        .style("opacity", 1);
                })
                .on("mouseout", function (d) 
                {
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0)
                        
                    //unhover return to normal state
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("stroke", "black")
                        .attr("stroke-width", 0.25)
                        .style("opacity", 0.75);
                })
                .style("fill", function (d) 
                {
                    //get data
                    var value = d.properties.value;
                    if (value) {
                        return color(value);
                    } else {
                        return "#ccc";
                    }
                })

            $("#reset").click(() => 
            {
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity);
            });
            $("#lessZoom").click(() => 
            {
                zoom.scaleBy(svg.transition().duration(750), 0.8);
            });
            $("#moreZoom").click(() => 
            {
                zoom.scaleBy(svg.transition().duration(750), 1.2);
            });
        })
    })
};

function UpdateMap() {
    d3.select("svg")
        .remove();
        _year_ = document.getElementById("year_select").value
        geomap("data/" + _year_ + ".csv");
}

_year_ = 2017;

window.onload = init;


