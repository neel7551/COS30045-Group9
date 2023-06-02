function init() {
    var w = 800;
    var h = 400;
    var padding = 80;
    var scalePadding = 150;
    var parseTime = d3.timeParse("%Y");

    // hover popup
    var tooltip = d3
        .select("#chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //legend groups
    var legendData = [
        { label: "Total", color: "black" },
        { label: "Male", color: "blue" },
        { label: "Female", color: "red" }
        ];

    // add svg to main html
    var svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h + padding);

    // read in data from csv file
    d3.csv("data/syrianPopulation.csv", function (d) {
        return {
        date: parseTime(d.year),
        number: +d.number,
        femaleTotal: +d.femaleTotal,
        maleTotal: +d.maleTotal,
        };
    }).then(function (data) {
        var dataset = data;
        lineChart(dataset);
        console.table(dataset, ["date", "maleTotal", "femaleTotal", "number"]);
    });

    var lineChart = function (dataset) {
        // create x and y scale
        xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function (d) {
                return d.date;
                }),
                d3.max(dataset, function (d) {
                return d.date;
                }),
            ])
            .range([0, w - scalePadding]);

        yScale = d3.scaleLinear()
            .domain([0,d3.max(dataset, function (d) {
                return d.number;
            }),])
            .range([h - padding, 10]);

        // create and translate axis
        var xAxis = d3.axisBottom()
            .ticks(10)
            .tickFormat(d3.timeFormat("%Y"))
            .scale(xScale);

        var yAxis = d3.axisLeft()
            .ticks(6)
            .scale(yScale);

        svg.append("g")
            .attr("transform", "translate(" + padding + ", " + (h - padding) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);

        // create line generator
        line = d3.line()
            .x(function (d) {return xScale(d.date);})
            .y(function (d) {return yScale(d.number);});

        // append data line to path
        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("transform", "translate(" + padding + ", 0)")
            .attr("d", line)
            .attr("stroke", "dimgrey")
            .style("fill", "none");

        // Draw the female line
        svg.append("path")
            .datum(dataset)
            .attr("class", "female-line")
            .attr("transform", "translate(" + padding + ", 0)")
            .attr("d", d3.line().x(function (d) {
                return xScale(d.date);
            }).y(function (d) {
                return yScale(d.femaleTotal);
            }))
            .attr("stroke", "red")
            .style("fill", "none");

        // Draw the male line
        svg.append("path")
            .datum(dataset)
            .attr("class", "male-line")
            .attr("transform", "translate(" + padding + ", 0)")
            .attr("d", d3.line().x(function (d) {
                return xScale(d.date);
            }).y(function (d) {
                return yScale(d.maleTotal);
            }))
            .attr("stroke", "blue")
            .style("fill", "none");

        // append label line
        svg.append("line")
            .attr("class", "fourMilLine")
            .attr("x1", padding)
            .attr("y1", yScale(4000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(4000000))
            .attr("stroke", d3.color("red"));

        // Array of values for the shadow lines
        var shadowValues = [1000000, 2000000, 3000000, 5000000, 6000000];

        // Loop through the values and create the shadow lines
        shadowValues.forEach(function (value) {
            svg.append("line")
                .attr("class", "shadowLine")
                .attr("x1", padding)
                .attr("y1", yScale(value))
                .attr("x2", w - padding + 10)
                .attr("y2", yScale(value))
                .attr("stroke-width", 0.25)
                .attr("stroke", d3.color("dimgray"));
            });

        svg.append("text")
        .attr("class", "fourMilLabel")
        .attr("x", padding + 10)
        .attr("y", yScale(4000000) - 7)
        .text("4 million Syrian Migrants (20% total population)");

        //x axis label
        svg.append("text")
            .attr("class", "xAxisLabel")
            .attr("x", 385)
            .attr("y", 360)
            .text("Years");

        //y axis label
        svg.append("text")
            .attr("class", "yAxisLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", 405)
            .attr("y", 350)
            .text("Number of Migrants");

        // Remove the x-axis label
        svg.select(".xAxisLabel").remove();

        // Append legend
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (padding + 10) + "," + (h - padding - 30) + ")");

        var legendItem = legend.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function(d, i) {
            return "translate(" + (220 + i * 80) + ", 63)";
        });

        legendItem.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function(d) {
            return d.color;
        });

        legendItem.append("text")
        .attr("x", 15)
        .attr("y", 4)
        .attr("dy", "0.35em")
        .text(function(d) {
            return d.label;
        });

        //append dots to total line
        svg.selectAll("dot")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function (d) {
                return xScale(d.date) + padding;
            })
            .attr("cy", function (d) {
                return yScale(d.number);
            })
            .attr("r", 4)
            .style("opacity", 0.5)
            .attr("fill", "dimgrey")
            .on("mouseover", function (event, d) {
                tooltip.transition()
                .duration(250)
                .style("opacity", 1);

                tooltip.html(function () {
                    let yr = d.date.getFullYear(); //Get the year from the date string
                    let total = d.number;
                    console.log(yr);
                    console.log(total);
                    if (yr && total) {
                    return yr + "<br>Total: " + total;
                    } else if (yr && !total) {
                    return yr + "<br>No data recorded";
                    } else {
                    return "No data available!";
                    }
                    })
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 28 + "px");

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("fill", "black");
                    })
            .on("mouseout", function (d) {
                tooltip.transition()
                .duration(250)
                .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.5)
                    .style("fill", "dimgrey");
            });
        
        //append dots to male line
            svg.selectAll(".male-dot")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "dot male-dot")
                .attr("cx", function (d) {
                    return xScale(d.date) + padding;
                })
                .attr("cy", function (d) {
                    return yScale(d.maleTotal);
                })
                .attr("r", 4)
                .attr("fill", "blue")
                .style("opacity", 0.5)
                .on("mouseover", function (event, d) {
                    tooltip.transition().duration(250).style("opacity", 1);

                    tooltip
                    .html(function () {
                        let yr = d.date.getFullYear();
                        let total = d.maleTotal;
                        if (yr && total) {
                        return yr + "<br>Male Total: " + total;
                        } else if (yr && !total) {
                        return yr + "<br>No data recorded";
                        } else {
                        return "No data available!";
                        }
                    })
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 28 + "px");

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", 1)
                        .style("fill", "black");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                    .duration(250)
                    .style("opacity", 0);

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", 0.5)
                        .style("fill", "blue");
                });

        //append dots to female line
            svg.selectAll(".female-dot")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "female-dot")
                .attr("cx", function (d) {
                    return xScale(d.date) + padding;
                })
                .attr("cy", function (d) {
                    return yScale(d.femaleTotal);
                })
                .attr("r", 4)
                .style("opacity", 0.5)
                .attr("fill", "red")
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);

                    tooltip.html(function () {
                        let yr = d.date.getFullYear();
                        let total = d.femaleTotal;
                        if (yr && total) {
                        return yr + "<br>Female Total: " + total;
                        } else if (yr && !total) {
                        return yr + "<br>No data recorded";
                        } else {
                        return "No data available!";
                        }
                    })
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 28 + "px");

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", 1)
                        .style("fill", "black");
                })
                .on("mouseout", function (d) {
                    tooltip.transition().duration(250).style("opacity", 0);

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("opacity", 0.5)
                        .style("fill", "red");
                });
    };
}

window.onload = init;
//window.onload = child;