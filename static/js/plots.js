// Fetch data for the line chart
fetch('/data')
    .then(response => response.json())
    .then(data => {
        console.log("Line Chart Data:", data);  // Log the data for debugging
        drawLineChart(data);
    })
    .catch(err => console.error("Error loading line chart data:", err));

// Fetch data for the bar chart
fetch('/ratings')
    .then(response => response.json())
    .then(data => {
        console.log("Bar Chart Data:", data);  // Log the data for debugging
        drawBarChart(data);
    })
    .catch(err => console.error("Error loading bar chart data:", err));

// Fetch data for the pie chart
fetch('/genres')
    .then(response => response.json())
    .then(data => {
        console.log("Genre Data:", data);  // Log the data for debugging
        drawPieChart(data);
    })
    .catch(err => console.error("Error loading genre data:", err));

fetch('/runtime-data')
    .then(response => response.json())
    .then(data => {
        drawBarGraph(data);
    })
    .catch(err => console.error("Error loading runtime data:", err));



// Line Chart Drawing Function
function drawLineChart(data) {
    // Clear existing chart (if any)
    d3.select("#line-chart").html("");

    // Prepare the data
    const parsedData = d3.group(
        data.map(d => ({
            year: +d.release_year,
            type: d.type,
            count: +d.count
        })),
        d => d.year
    );

    const years = Array.from(parsedData.keys()).sort((a, b) => a - b);
    const movieCounts = years.map(year =>
        parsedData.get(year)?.find(d => d.type === 'MOVIE')?.count || 0
    );
    const tvCounts = years.map(year =>
        parsedData.get(year)?.find(d => d.type === 'SHOW')?.count || 0
    );

    // Dimensions
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG container for the line chart
    const svg = d3.select("#line-chart")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(years), d3.max(years)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max([...movieCounts, ...tvCounts])])
        .nice()
        .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickValues(d3.range(d3.min(years),d3.max(years),10));
    console.log(d3.min(years),d3.max(years))
    const yAxis = d3.axisLeft(yScale);
    

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // Line generators
    const lineGenerator = d3.line()
        .x((d, i) => xScale(years[i]))
        .y(d => yScale(d));

    // Draw movie line
    svg.append("path")
        .datum(movieCounts)
        .attr("class", "line movie-line")
        .attr("d", lineGenerator);

    // Draw TV Show line
    svg.append("path")
        .datum(tvCounts)
        .attr("class", "line tv-line")
        .attr("d", lineGenerator);

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 10)`);

    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", "steelblue");
    legend.append("text").attr("x", 15).attr("y", 10).text("Movies").attr("font-size", "12px").attr("alignment-baseline", "middle");

    legend.append("rect").attr("x", 0).attr("y", 20).attr("width", 10).attr("height", 10).attr("fill", "orange");
    legend.append("text").attr("x", 15).attr("y", 30).text("TV Shows").attr("font-size", "12px").attr("alignment-baseline", "middle");
}


// Bar Chart Drawing Function
function drawBarChart(data) {
    // Clear existing chart (if any)
    d3.select("#bar-chart").html("");

    // Dimensions
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG container for the bar chart
    const svg = d3.select("#bar-chart")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.age_certification))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // Draw bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.age_certification))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.count))
        .attr("fill", "steelblue");

    // Add labels to bars
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.age_certification) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.count) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.count)
        .attr("font-size", "12px")
        .attr("fill", "black");
}


// Pie Chart Drawing Function
function drawPieChart(data) {
  // Dimensions
  const width = 500, height = 500, margin = 50;
  const radius = Math.min(width, height) / 2 - margin;

  // Clear existing content
  d3.select("#genres-chart").selectAll("*").remove();

  // Create SVG container
  const svg = d3.select("#genres-chart")
      .append("svg")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2);

  const chartGroup = svg.append("g")
      .attr("transform", `translate(${(width + margin * 2) / 2}, ${(height + margin * 2) / 2})`);

  // Create color scale
  const color = d3.scaleOrdinal()
      .domain(data.map(d => d.main_genre))
      .range(d3.quantize(d3.interpolateRainbow, data.length));

  // Create pie generator
  const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

  // Create arc generator
  const arc = d3.arc()
      .innerRadius(0) // Full pie chart
      .outerRadius(radius);

  // Create slices
  const slices = chartGroup.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.main_genre))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 1);

  // Draw legend
  const legend = svg.append("g")
      .attr("transform", `translate(${margin-40}, ${margin+70})`); // Position legend to top-left corner

  const legendItems = legend.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
          // Reset all slices
          slices.style("opacity", 0.4);

          // Highlight selected slice
          slices
              .filter(slice => slice.data.main_genre === d.main_genre)
              .style("opacity", 1);
      });

  legendItems.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => color(d.main_genre));

  legendItems.append("text")
      .attr("x", 20) // Position text next to the rectangle
      .attr("y", 12) // Align vertically with the rectangle
      .text(d => d.main_genre)
      .attr("font-size", "12px")
      .attr("alignment-baseline", "middle");
}

function drawBarGraph(data) {
  // Dimensions
  const margin = { top: 50, right: 30, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select("#runtime-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleBand()
      .domain(data.map(d => d.runtime)) // Unique runtimes
      .range([0, width])
      .padding(0.2);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]) // Count is the number of titles
      .nice()
      .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)") // Rotate labels for readability
      .style("text-anchor", "end")
      .style("font-size", "10px");

  svg.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "10px");

  // Draw bars
  svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.runtime))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.count))
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "orange");
      })
      .on("mouseout", function () {
          d3.select(this).attr("fill", "steelblue");
      });

  // Add axis labels
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height + 40})`)
      .style("font-size", "12px")
      .text("Runtime (minutes)");

  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(-50,${height / 2})rotate(-90)`)
      .style("font-size", "12px")
      .text("Number of Titles");
}

// Fetch years and populate the dropdown
fetch('/years')
    .then(response => response.json())
    .then(years => {
        const yearSelect = d3.select("#year-select");

        // Populate dropdown with years
        years.forEach(year => {
            yearSelect.append("option").text(year).attr("value", year);
        });

        // Set default selected year to the first year in the list
        const defaultYear = years[46];
        yearSelect.property("value", defaultYear);  // Set the default selected year

        // Trigger the change event to load the data for the default year
        fetch(`/imdb-data/${defaultYear}`)
            .then(response => response.json())
            .then(data => drawIMDbBarChart(data, defaultYear))
            .catch(err => console.error("Error loading IMDb data:", err));
    })
    .catch(err => console.error("Error loading years:", err));

// Event listener for year dropdown
d3.select("#year-select").on("change", function () {
    const selectedYear = this.value;
    if (selectedYear) {
        fetch(`/imdb-data/${selectedYear}`)
            .then(response => response.json())
            .then(data => drawIMDbBarChart(data, selectedYear))
            .catch(err => console.error("Error loading IMDb data:", err));
    } else {
        // Clear chart if no year is selected
        d3.select("#imdb-chart").selectAll("*").remove();
    }
});

// Draw the IMDb Bar Chart
function drawIMDbBarChart(data, year) {
    // Clear existing chart
    d3.select("#imdb-chart").selectAll("*").remove();

    // Dimensions
    const margin = { top: 50, right: 10, bottom: 30, left: 120 };
    const width = 300 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const fixedBarWidth = 10; 

    // Create SVG container
    const svg = d3.select("#imdb-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.imdb_score)])  // IMDb score on x-axis
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.title))  // Titles on y-axis
        .range([0, height])
        .padding(0.2);

    // Axes
    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("font-size", "10px");

    svg.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "10px");
    // Draw bars
   // Create a tooltip
const tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("position", "absolute")
.style("visibility", "hidden")
.style("background-color", "rgba(0, 0, 0, 0.7)")
.style("color", "white")
.style("padding", "5px")
.style("border-radius", "5px")
.style("font-size", "12px");

// Draw bars with custom tooltip
svg.selectAll(".bar")
.data(data)
.enter()
.append("rect")
.attr("class", "bar")
.attr("x", 0)  // The x-position of the bars (start at 0)
.attr("y", d => yScale(d.title))  // The y-position is determined by the title scale
.attr("width", d => xScale(d.imdb_score) < fixedBarWidth ? fixedBarWidth : xScale(d.imdb_score))  // Fixed width for small scores, otherwise scale based on IMDb score
.attr("height", yScale.bandwidth())  
.attr("fill", "steelblue")
.on("mouseover", function(event, d) {
    tooltip.style("visibility", "visible")
        .text(`${d.title}: ${d.imdb_score}`);  // Display title and IMDb score
})
.on("mousemove", function(event) {
    tooltip.style("top", (event.pageY + 5) + "px")
        .style("left", (event.pageX + 5) + "px");  // Position the tooltip near the mouse
})
.on("mouseout", function() {
    tooltip.style("visibility", "hidden");  // Hide tooltip on mouse out
});


    // Chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`IMDb Score per Release year and Title`);
}
