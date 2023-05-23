function init() {
  d3.csv("demographicPopulation.csv").then(function(data) {
    var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // Extract the available years from the dataset
    var years = data.map(function(d) {
      return d.year;
    });

    // Create a dropdown menu for year selection
    var dropdown = d3.select("#dropdown");
    dropdown
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      });

    // Default to the first year in the dataset
    var selectedYear = years[0];
    updateChart(selectedYear);

    // Handle year selection change
    dropdown.on("change", function() {
      selectedYear = this.value;
      updateChart(selectedYear);
    });

    function updateChart(year) {
      // Filter the data for the selected year
      var filteredData = data.filter(function(d) {
        return d.year === year;
      });

      // Process the filtered data
      var ageGroups = data.columns.slice(1); // Extract the age group column names

      var dataset = [];

      filteredData.forEach(function(row) {
        var genderData = {};
        ageGroups.forEach(function(ageGroup) {
          var gender = ageGroup[0] === "f" ? "Female" : "Male";
          var ageRange = getAgeRange(ageGroup);
          var value = parseInt(row[ageGroup]);

          if (!genderData[gender]) {
            genderData[gender] = [];
          }

          genderData[gender].push({
            ageGroup: ageRange,
            value: value
          });
        });

        Object.keys(genderData).forEach(function(gender) {
          var obj = {
            gender: gender,
            ageGroups: genderData[gender]
          };
          dataset.push(obj);
        });
      });

      console.log(dataset);

      // Set up chart dimensions
      var margin = { top: 20, right: 20, bottom: 50, left: 60 };
      var width = 800 - margin.left - margin.right;
      var height = 400 - margin.top - margin.bottom;

      // Remove any existing chart elements
      d3.select("#child")
        .selectAll("*")
        .remove();

      // Create SVG container
      var svg = d3
        .select("#child")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Define scales
      var xScale = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) {
          return d3.max(d.ageGroups, function(ageGroup) {
            return ageGroup.value;
          });
        })])
        .range([height, 0]);

      // Set domain for scales
      xScale.domain(
        ageGroups.map(function(ageGroup) {
          return getAgeRange(ageGroup.slice(1)); // Remove the gender prefix from the age group
        })
      );
      yScale.domain([
        0,
        d3.max(dataset, function(d) {
          return d3.max(d.ageGroups, function(ageGroup) {
            return ageGroup.value;
          });
        })
      ]);

      var value_total = d3.sum(dataset, function(d) {
        return d.value;
      });

      // Create bars
      var bars = svg
      .selectAll(".bar")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "bar");

      bars
      .selectAll("rect")
      .data(function(d) {
        return d.ageGroups;
      })
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return xScale(d.ageGroup);
      })
      .attr("y", function(d) {
        return yScale(+d.value); // Parse the value as an integer
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) {
        return height - yScale(+d.value); // Parse the value as an integer
      })
      .attr("fill", "blue");
        

      // Add axes
      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g").attr("class", "y axis").call(yAxis);

      // Add chart title
      svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Age Demographics by Gender - " + year);
    }
  });
}

function getAgeRange(ageGroup) {
  var age = ageGroup.slice(1);
  var lower = age.slice(0, 2);
  var upper = age.slice(2);

  return lower + " - " + upper;
}

window.onload = init;