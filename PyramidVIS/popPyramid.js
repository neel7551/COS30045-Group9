function init() {
    document.getElementById("year_select").value = _year_;
    popPyramid("data/" + _year_ + ".csv");
}

function popPyramid(demographicPopulation) {
        // Set the dimensions of the chart
    const margin = { top: 40, right: 20, bottom: 30, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    var padding = 80;
    var scalePadding = 15;

        // hover popup
    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        //legend groups
    var legendData = [
        { label: "Female", color: "salmon" },
        { label: "Male", color: "lightblue" }        
        ];

        // Define color scheme
    const colorScale = d3.scaleOrdinal()
            .domain(["fValue", "mValue"])
            .range(["salmon", "lightblue"]);

        // Create the SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + scalePadding)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        // Load the CSV data
    d3.csv(demographicPopulation).then(function (data) {
        // Parse the data
        data.forEach(function (d) {
            d.fPercent = +d.fPercent;
            d.mPercent = +d.mPercent;
            d.fValue = +d.fValue;
            d.mValue = +d.mValue; //Convert string to number
        });

        // Check for NaN values after parsing
    console.log(data.filter(d => isNaN(d.fValue) || isNaN(d.mValue)));

        // Create the y scale
    const yScale = d3.scaleBand()
        .domain(data.map((d) => d.group))
        .range([0, height])
        .padding(0.1);

        // Calculate the maximum value for both fValue and mValue
    const maxFMValue = d3.max(data, (d) => Math.max(d.fValue, d.mValue));

        // Create the x scales
    const xScaleF = d3.scaleLinear()
        .domain([0, maxFMValue])
        .range([width / 2, 0])

    const xScaleM = d3.scaleLinear()
        .domain([0, maxFMValue])
        .range([width / 2, width]);

        // Append legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (padding + 10) + "," + (height - padding - 30) + ")");

    var legendItem = legend.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function(d, i) {
            return "translate(" + (185 + i * 80) + "," + (i-250)+ ")";
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

    // Create the 'f' bars
    svg.selectAll(".bar-f")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar-f")
        .attr("x", (d) => xScaleF(d.fValue))
        .attr("y", (d) => yScale(d.group))
        .attr("width", (d) => width / 2 - xScaleF(d.fValue))
        .attr("height", yScale.bandwidth())
        .attr("transform", `translate(-25,0)`)
        .on("mouseover", function (event, d) {
            tooltip.transition()
            .duration(250)
            .style("opacity", 1);

            tooltip.html(function () {
                let age = d.group;
                let total = d.fValue;
                let percent = d.fPercent;
                console.log(total);
                if (age && total) {
                return "<b>Females Age: " + age + "</b><br>Migrators: " + total + "<br>Percentage: " + percent;
                } else if (age && !total) {
                return "Females Age: " + age + "<br>No data recorded";
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
                .style("fill", "red");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
            .duration(250)
            .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "salmon");
        })
        .attr("fill", (d) => colorScale("fValue")); // Assign color based on "fValue"

    // Create the 'm' bars
    svg.selectAll(".bar-m")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar-m")
        .attr("x", width / 2)
        .attr("y", (d) => yScale(d.group))
        .attr("width", (d) => xScaleM(d.mValue) - width / 2)
        .attr("height", yScale.bandwidth())
        .attr("transform", `translate(25,0)`)
        .on("mouseover", function (event, d) {
            tooltip.transition()
            .duration(250)
            .style("opacity", 1);

            tooltip.html(function () {
                let age = d.group;
                let total = d.mValue;
                let percent = d.mPercent;
                console.log(total);
                if (age && total) {
                    return "<b>Males Age: " + age + "</b><br>Migrators: " + total + "<br>Percentage: " + percent;
                } else if (age && !total) {
                return "Males Age: " + age + "<br>No data recorded";
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
                .style("fill", "#3498DB");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
            .duration(250)
            .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "lightblue");
        })
        .attr("fill", (d) => colorScale("mValue")); // Assign color based on "mValue"

    // Create left y-axis
    svg.append("g")
        .attr("class", "y-axis-left")
        .attr("transform", `translate(${width / 2 - 25}, 0)`)
        .call(d3.axisRight(yScale));

    // Create right y-axis
    svg.append("g")
        .attr("class", "y-axis-right")
        .attr("transform", `translate(${width / 2 + 25}, 0)`)
        .call(d3.axisLeft(yScale));

        // Remove the y-axis label
    svg.select(".y-axis-right")
        .selectAll("text")
        .remove();

        //move all y axis text 4px right
    svg.select(".y-axis-left")
        .selectAll("text")
        .attr("transform", `translate(4,0)`);

        //move 60+ label to the center of gap
    svg.select(".y-axis-left")
        .selectAll(".tick:nth-last-child(2)")
        .select("text")
        .attr("transform", `translate(9.5,0)`)
        
    // Create the 'f' x-axis
    const xAxisF = svg.append("g")
        .attr("class", "x-axis-f")
        .attr("transform", `translate(-25,${height})`)
        .call(d3.axisBottom(xScaleF).tickFormat(d3.format(".2s")))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .each(function(d, i) {
            const xPos = xScaleF(d);
            svg.append("line")
                .attr("class", "shadow-line")
                .attr("x1", xPos)
                .attr("y1", 330)
                .attr("x2", xPos)
                .attr("y2", 0)
                .attr("stroke", "gray")
                .attr("stroke-opacity", 0.3)
                .attr("stroke-width", 0.75)
                .attr("transform", `translate(-25,0)`);
        });

            // Create the 'm' x-axis
    const xAxisM = svg.append("g")
        .attr("class", "x-axis-m")
        .attr("transform", `translate(25,${height})`)
        .call(d3.axisBottom(xScaleM).tickFormat(d3.format(".2s")))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .each(function(d, i) {
            const xPos = xScaleM(d);
            svg.append("line")
                .attr("class", "shadow-line")
                .attr("x1", xPos)
                .attr("y1", 330)
                .attr("x2", xPos)
                .attr("y2", 0)
                .attr("stroke", "gray")
                .attr("stroke-opacity", 0.3)
                .attr("stroke-width", 0.75)
                .attr("transform", `translate(25,0)`);
            });
        })
}

function UpdateMap() {
    d3.select("svg")
        .remove();
        _year_ = document.getElementById("year_select").value
        popPyramid("data/" + _year_ + ".csv");
}

_year_ = 2017;

window.onload = init;