import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import './App.css';

function drawLineChart(data) {
  // Filter out invalid entries
  const validData = data.filter(
    (d) => !isNaN(d.release_year) && !isNaN(d.count)
  );

  console.log("Valid Data for Graph1:", validData);

  // If no valid data, exit early
  if (validData.length === 0) {
    console.error("No valid data to display in the chart.");
    return;
  }

  // Clear existing chart (if any)
  d3.select("#line-chart").html("");

  // Dimensions
  const margin = { top: 50, right: 30, bottom: 50, left: 50 };
  const width = 595 - margin.left - margin.right;
  const height = 326 - margin.top - margin.bottom;

  // Create SVG container for the line chart
  const svg = d3
    .select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(validData, (d) => d.release_year)) // Extent gives min and max
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(validData, (d) => d.count)]) // Maximum value for counts
    .nice()
    .range([height, 0]);

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))); // Format years as integers

  svg.append("g").call(d3.axisLeft(yScale));

  // Line generator
  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.release_year))
    .y((d) => yScale(d.count));

  // Draw line
  svg
    .append("path")
    .datum(validData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineGenerator);

  // Add data points as dots
  svg
    .selectAll(".dot")
    .data(validData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.release_year))
    .attr("cy", (d) => yScale(d.count))
    .attr("r", 2)
    .attr("fill", "red");

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 17) // Positioned below the x-axis
    .text("Release Year") // Update this to your desired label
    .attr("font-size", "10px");
   
    svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`) // Rotate the text for Y-axis
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20) // Positioned to the left of the y-axis
    .text("Numbder of Titles") // Update this to your desired label
    .attr("font-size", "10px");  


    const legend = svg.append("g")
        .attr("transform", `translate(${width-560}, -35)`);

    //legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 20).attr("fill", "steelblue");
    legend.append("text").attr("x", 15).attr("y", 10).text("Number of Titles per Release Year").attr("font-size", "15px").attr("alignment-baseline", "middle").attr("fill", "red");

}

// Bar Chart Function (Graph 2)
function drawBarChart(data) {
  if (data.length === 0) {
    console.error("No valid data to display in the bar chart.");
    return;
  }

  d3.select("#bar-chart").html("");

  const margin = { top: 50, right: 30, bottom: 50, left: 50 };
  const width = 595 - margin.left - margin.right;
  const height = 326 - margin.top - margin.bottom;

  const svg = d3
    .select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.age_certification))
    .range([0, width])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(yScale));

  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.age_certification))
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.count))
    .attr("fill", "red");

  svg
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d.age_certification) + xScale.bandwidth() / 2)
    .attr("y", (d) => yScale(d.count) - 5)
    .attr("text-anchor", "middle")
    .text((d) => d.count)
    .attr("font-size", "12px")
    .attr("fill", "black");

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 17)
    .text("Age Certification")
    .attr("font-size", "10px");

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Number of Titles")
    .attr("font-size", "10px");
}

function drawBarGraph(data) {

  if (data.length === 0) {
    console.error("No valid data to display in the bar chart.");
    return;
  }

  d3.select("#runtime-chart").html("");
  // Dimensions
  const margin = { top: 50, right: 30, bottom: 50, left: 70 };
  const width = 595 - margin.left - margin.right;
  const height = 326 - margin.top - margin.bottom;

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

  // // Axes
  // const xAxis = d3.axisBottom(xScale);
  // const yAxis = d3.axisLeft(yScale);

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)") // Rotate labels for readability
      .style("text-anchor", "end")
      .style("font-size", "10px");

  svg.append("g")
      .call(d3.axisLeft(yScale))
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
      .attr("fill", "red")
      .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "orange");
      })
      .on("mouseout", function () {
          d3.select(this).attr("fill", "steelblue");
      });

  // Add axis labels
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 17)     
      .text("Runtime (minutes)")
      .attr("font-size", "10px");
      

  svg.append("text")
     .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text("Number of Titles")
      .attr("font-size", "10px");
}

function drawPieChart(data) {
  if (data.length === 0) {
    console.error("No valid data to display in the bar chart.");
    return;
  }

  // Clear existing content
  d3.select("#genres-chart").selectAll("*").remove();

  // Dimensions
  const width = 500, height = 500, margin = 50;
  const radius = Math.min(width, height) / 2 - margin;


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


const App = () => {
  const [graphData, setGraphData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [barrChartData, setBarrChartData] = useState(null);
  const [PieChartData, setPieChartData] = useState(null);




  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data); // Log the data for debugging
        if (data.graph1) {
          // Extract and process the data for graph1
          const processedData = Object.entries(data.graph1).map(([year, count]) => {
            const parsedYear = +year; // Convert year to number
            const parsedCount = +count; // Convert count to number

            //console.log("Parsed:", { year: parsedYear, count: parsedCount });

            return { release_year: parsedYear, count: parsedCount };
          });

          //console.log("Processed Data for Graph1:", processedData);
          setGraphData(processedData); // Store processed data in the state
        }  if (data.graph2) {
          const processedBarData = Object.entries(data.graph2).map(
            ([age_certification, count]) => ({
              age_certification,
              count: +count,
            })
          );
          setBarChartData(processedBarData);
        }
        if (data.graph3){
          const processedBarrData = Object.entries(data.graph3).map(
            ([runtime, count]) => ({
              runtime,
              count: +count,
            })
          );
          setBarrChartData(processedBarrData);
        }
        if (data.graph4){
          const processedPieData = Object.entries(data.graph4).map(
            ([runtime, count]) => ({
              runtime,
              count: +count,
            })
          );
          setPieChartData(processedPieData);
        }
      })
   
      .catch((err) => console.error("Error loading line chart data:", err));
  }, []);

  useEffect(() => {
    if (graphData) drawLineChart(graphData);
  }, [graphData]);

  useEffect(() => {
    if (barChartData) drawBarChart(barChartData);
  }, [barChartData]);

  useEffect(() => {
    if (barrChartData) drawBarGraph(barrChartData);
  }, [barrChartData]);
  useEffect(() => {
    if (PieChartData) drawPieChart(PieChartData);
  }, [PieChartData]);

  const layout = [
  { i: 'graph1', x: 0, y: 0, w: 6, h: 8 },
  { i: "graph2", x: 6, y: 0, w: 6, h: 8 },
  { i: "graph3", x: 6, y: 0, w: 6, h: 8 },
  { i: "graph4", x: 6, y: 0, w: 6, h: 8 }

];

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
    >
      <div key="graph1">
        <div id="line-chart"></div>
      </div>
      <div key="graph2">
        <div id="bar-chart"></div>
      </div>
      <div key="graph3">
        <div id="runtime-chart"></div>
      </div>
    </GridLayout>
  );
};

export default App;
