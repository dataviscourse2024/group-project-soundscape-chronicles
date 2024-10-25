// Constants for the charts, that would be useful.
const CHART_WIDTH = 650;
const CHART_HEIGHT = 400;
const MARGIN = { left: 70, bottom: 40, top: 20, right: 20 };
const INNER_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const ANIMATION_DUATION = 300;

let SvgLineChart,
  SvgBarChart,
  SvgPieChart,
  SvgFilledLinePlot,
  SvgCircle,
  SvgStackedBar;

const emotionColors = {
  happy: "#FF0000",
  energetic: "#00FF00",
  calm: "#0000FF",
  sad: "#FFFF00",
};

setup();

async function setup() {
  //Linechart-div
  SvgLineChart = createChartSVG("#Linechart-div");

  //Barchart-div
  SvgBarChart = createChartSVG("#Barchart-div");

  //Piechart-div
  SvgPieChart = createChartSVG("#Piechart-div");

  //Filledlineplot-div
  SvgFilledLinePlot = createChartSVG("#Filledlineplot-div");

  //Circle-div
  SvgCircle = createChartSVG("#Circle-div");

  //Stackedbar-div
  SvgStackedBar = createChartSVG("#Stackedbar-div");

  let combined_data = await loadData();

  //line chart stuff
  let line_chart_data = await lineChartProcessData(combined_data);
  updateLineChart(line_chart_data);

  //circle chart stuff
  let circle_chart_data = await circleChartProcessData(combined_data);
  console.log(circle_chart_data);
  const years = circle_chart_data.map((d) => d.year);
  sliderForCircleChart(
    circle_chart_data,
    Math.min(...years),
    Math.max(...years)
  );
  updateCircleChart(circle_chart_data, Math.min(...years));
  updateStackedBarChart(circle_chart_data);
}

function createChartSVG(chartId) {
  console.log("Creating chart SVG for", chartId);
  return d3
    .select(chartId)
    .append("svg")
    .attr("height", CHART_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("width", CHART_WIDTH + MARGIN.left + MARGIN.right)
    .append("g")
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
}

async function loadData() {
  return fetch("data/combined_data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching the data");
      }
      return response.json();
    })
    .then((data) => {
      combinedData = data;
      return combinedData;
    })
    .catch((error) => {
      console.error("Error fetching the data:", error);
    });
}

async function lineChartProcessData(data) {
  console.log("processing data for line chart");
  let emotionTotals = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    const year = date.getFullYear();
    const label = d.label;
    if (!emotionTotals[year]) {
      emotionTotals[year] = {};
      emotionTotals[year]["happy"] = 0;
      emotionTotals[year]["sad"] = 0;
      emotionTotals[year]["energetic"] = 0;
      emotionTotals[year]["calm"] = 0;
    }
    emotionTotals[year][label] = emotionTotals[year][label] + 1;
  });
  console.log(emotionTotals);
  const musicTypeCount = [];
  for (const year in emotionTotals) {
    for (const label in emotionTotals[year]) {
      musicTypeCount.push({
        year: year,
        label: label,
        count: emotionTotals[year][label],
      });
    }
  }
  return musicTypeCount;
}

function updateLineChart(data) {
  //https://d3-graph-gallery.com/graph/line_basic.html

  //copilot helped me with this
  let xScale = d3
    .scalePoint()
    .domain(data.map((d) => d.year))
    .range([0, INNER_WIDTH]);

  //copilot helped me with this
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .range([INNER_HEIGHT, 0]);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.count));

  SvgLineChart.selectAll("*").remove();

  //apending axis
  SvgLineChart.append("g")
    .attr("transform", "translate(0," + INNER_HEIGHT + " )")
    .attr("class", "xAxis")
    .call(d3.axisBottom(xScale).ticks(data.length));

  SvgLineChart.append("g").attr("class", "yAxis").call(d3.axisLeft(yScale));

  //copilot helped me with this
  for (const emotion of Object.keys(emotionColors)) {
    const emotionData = data.filter((d) => d.label === emotion);
    console.log(`Emotion: ${emotion}`, emotionData); // Debugging line
    //creating line
    SvgLineChart.append("path")
      .datum(emotionData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", emotionColors[emotion])
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator)
      // copilot helped here
      .attr("opacity", 1);
  }

  //adding axis labels
  SvgLineChart.append("text")
    .attr("text-anchor", "middle")
    .attr("x", INNER_WIDTH / 2)
    .attr("y", INNER_HEIGHT + MARGIN.bottom)
    .text("Year");
  SvgLineChart.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -(INNER_HEIGHT / 2))
    .attr("y", -45)
    .text("Song Emotion Count");
  //dynamically changing the header
  document.getElementById(
    "line-chart-header"
  ).innerText = `Line Chart - Song Emotion Count`;
}

function updateCircleChart(data, value) {
  SvgCircle.selectAll("*").remove();
  console.log("updating circle chart with value", value);

  //copilot helped with this
  const circle_coors = [
    { x: INNER_WIDTH / 5, y: INNER_HEIGHT / 2, emotion: "happy" },
    { x: (2 * INNER_WIDTH) / 5, y: INNER_HEIGHT / 2 + 100, emotion: "calm" },
    {
      x: (3 * INNER_WIDTH) / 5,
      y: INNER_HEIGHT / 2 - 100,
      emotion: "energetic",
    },
    { x: (4 * INNER_WIDTH) / 5, y: INNER_HEIGHT / 2, emotion: "sad" },
  ];

  const yearData = data.filter((d) => d.year == value);

  circle_coors.forEach((pos) => {
    const emotionData = yearData.find((d) => d.label === pos.emotion);

    if (emotionData && emotionData.count > 0) {
      SvgCircle.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", 100 * emotionData.count)
        .attr("fill", emotionColors[pos.emotion])
        .attr("class", "circle")
        .attr("opacity", 1);
    }
  });
}

async function circleChartProcessData(data) {
  console.log("processing data for circle chart");
  let emotionTotals = {};
  let yearTotal = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    const year = date.getFullYear();
    const label = d.label;
    if (!emotionTotals[year]) {
      emotionTotals[year] = {};
      emotionTotals[year]["happy"] = 0;
      emotionTotals[year]["sad"] = 0;
      emotionTotals[year]["energetic"] = 0;
      emotionTotals[year]["calm"] = 0;
    }
    if (!yearTotal[year]) {
      yearTotal[year] = 0;
    }
    yearTotal[year] = yearTotal[year] + 1;
    emotionTotals[year][label] = emotionTotals[year][label] + 1;
  });
  console.log(emotionTotals);
  const musicTypeCount = [];
  for (const year in emotionTotals) {
    for (const label in emotionTotals[year]) {
      musicTypeCount.push({
        year: year,
        label: label,
        count: emotionTotals[year][label] / yearTotal[year],
      });
    }
  }
  return musicTypeCount;
}

function updateStackedBarChart(data) {
  SvgStackedBar.selectAll("*").remove();
  //https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

  data.forEach(function (d) {
    d.count = +d.count;
  });

  var subgroups = ["happy", "sad", "energetic", "calm"];

  //copilot helped with this
  var groups = Array.from(new Set(data.map((d) => d.year)));

  var xScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, INNER_WIDTH])
    .padding([0.2]);
  var yScale = d3
    .scaleLinear()
    .domain([0, 1]) // Max value based on counts
    .range([INNER_HEIGHT, 0]);

  SvgStackedBar.append("g")
    .attr("transform", "translate(0," + INNER_HEIGHT + " )")
    .attr("class", "xAxis")
    .call(d3.axisBottom(xScale).tickSizeOuter(0));
  SvgStackedBar.append("g").attr("class", "yAxis").call(d3.axisLeft(yScale));

  var color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(["#e41a1c", "#377eb8", "#4daf4a", "#ff7f00"]);

  const groupedData = d3.group(data, (d) => d.year);

  var stackedData = d3.stack().keys(subgroups)(
    Array.from(groupedData, ([year, values]) => {
      const result = { year };
      subgroups.forEach((emotion) => {
        const total = values.reduce(
          (acc, d) => acc + (d.emotion === emotion ? d.proportion : 0),
          0
        );
        result[emotion] = total; // Create a key for each emotion
      });
      return result;
    })
  );

  SvgStackedBar.append("g")
    .selectAll("g")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", function (d) {
      return color(d.key);
    })
    .selectAll("rect")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xScale(d.data[0]);
    })
    .attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr("height", function (d) {
      return yScale(d[0]) - yScale(d[1]);
    })
    .attr("width", xScale.bandwidth());
}

function sliderForCircleChart(data, min, max) {
  let slider = document.getElementById("circle-slider");
  slider.min = min;
  slider.max = max;
  slider.value = min;
  document.getElementById("circle-label").innerText = min;
  document.getElementById("circle-slider").value = min;
  slider.addEventListener("input", function () {
    document.getElementById("circle-label").innerText = this.value;
    updateCircleChart(data, this.value);
  });
}
