function init () 
{
    var w = 800;
    var h = 400;
    var padding = 80;
    var scalePadding = 150;
    var parseTime = d3.timeParse("%Y");

    //hover popup
    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //add svg to main html
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h + padding);

    //read in data from csv file
    d3.csv("syrianPopulation.csv", function(d){
        return {
            date: parseTime(d.year),
            number: +d.number
        };
    }).then(function(data){
        var dataset = data;
        lineChart(dataset);
        console.table(dataset, ["date", "number"]);
    });

    var lineChart = function(dataset) {
    //create x and y scale
        xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function(d){ return d.date; }),
                d3.max(dataset, function(d){ return d.date; })
            ])
            .range([0, w - scalePadding]);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) { return d.number; })
            ])
            .range([h - padding, 10]);

    //create and translate axis
        var xAxis = d3.axisBottom()
            .ticks(10)
            .tickFormat(d3.timeFormat("%Y"))
            .scale(xScale);

        var yAxis = d3.axisLeft()
            .ticks(7)
            .scale(yScale);
        
        svg.append("g")
            .attr("transform", "translate(" + padding + ", "+ (h - padding) +")")
            .call(xAxis);
        
        svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);  
                
    //create line generator
        line = d3.line()  
            .x(function(d) {return xScale(d.date);})
            .y(function(d) {return yScale(d.number);});

    //append data line to path
        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("transform", "translate(" + padding + ", 0)")
            .attr("d", line)
            .attr("stroke", "dimgray")
	        .style("fill", "none");

    //append label line 
        svg.append("line")
            .attr("class", "fourMilLine")
            .attr("x1", padding)
            .attr("y1", yScale(4000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(4000000))
	        .attr("stroke", d3.color("red"));

            //1m
        svg.append("line")
            .attr("class", "shadowLine")
            .attr("x1", padding)
            .attr("y1", yScale(1000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(1000000))
            .attr("stroke-width", 0.25)
	        .attr("stroke", d3.color("dimgray"));
            //2m
        svg.append("line")
            .attr("class", "shadowLine")
            .attr("x1", padding)
            .attr("y1", yScale(2000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(2000000))
            .attr("stroke-width", 0.25)
	        .attr("stroke", d3.color("dimgray"));
            //3m
        svg.append("line")
            .attr("class", "shadowLine")
            .attr("x1", padding)
            .attr("y1", yScale(3000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(3000000))
            .attr("stroke-width", 0.25)
	        .attr("stroke", d3.color("dimgray"));
            //5m
        svg.append("line")
            .attr("class", "shadowLine")
            .attr("x1", padding)
            .attr("y1", yScale(5000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(5000000))
            .attr("stroke-width", 0.25)
	        .attr("stroke", d3.color("dimgray"));
            //6m
        svg.append("line")
            .attr("class", "shadowLine")
            .attr("x1", padding)
            .attr("y1", yScale(6000000))
            .attr("x2", w - padding + 10)
            .attr("y2", yScale(6000000))
            .attr("stroke-width", 0.25)
	        .attr("stroke", d3.color("dimgray"));
        
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

    //append dots
        svg.selectAll("dot")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", function(d) { return xScale(d.date) + padding; })
                .attr("cy", function(d) { return yScale(d.number); })
                .attr("r", 4)
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 1);

                    tooltip.html( function () //displays data in tooltip
                        {
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
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px")

                        d3.select(this)
                            .transition()
                            .duration(200)
                            .style("fill", "red");
                    })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0)
                        
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("fill", "black");
                });
    }
};

window.onload = init;