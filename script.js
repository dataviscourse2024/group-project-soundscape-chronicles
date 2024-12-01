// CHATGPT wrote all of our JDOC function headers

const CHART_WIDTH = 650;
const CHART_HEIGHT = 400;
const MARGIN = { left: 70, bottom: 40, top: 20, right: 20 };
const INNER_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const ANIMATION_DUATION = 300;
const SPOTIFY_GREEN = '#1ed760';
let hideModalTimeout = 200;
let selections = 'NO'

let SvgLineChart, SvgRankLineChart, SvgCircle, SvgStackedBar, SvgAreaChart;

const emotionColors = {
  happy: "#D55E00",
  energetic: "#CC79A7",
  calm: "#F3EA77",
  sad: "#0072B2",
};

/**
 * Sets up the charts and processes data for each chart type.
 * @async
 * @function setup
 */
setup();

async function setup() {
  //Linechart-div
  SvgLineChart = createChartSVG("#Linechart-div");

  //Barchart-div
  SvgRankLineChart = createChartSVG("#rankLineChart-div");

  //Circle-div
  SvgCircle = createChartSVG("#Circle-div");

  //Stackedbar-div
  SvgStackedBar = createChartSVG("#Stackedbar-div");

  //AreaChart-div
  SvgAreaChart = createChartSVG("#AreaChart-div");

  let combinedData = await loadData();
  let eventsData = await loadEventData();

  //line chart
  let lineChartData = await lineChartProcessData(combinedData);
  updateLineChart(lineChartData, SvgLineChart, "Song Emotion Count", false, eventsData, selections);

  //circle chart
  let circleChartData = await circleChartProcessData(combinedData);
  createSliderForCircleChart(circleChartData);
  updateCircleChart(
    circleChartData,
    Math.min(...circleChartData.map((d) => d.year))
  );

  //stacked bar chart
  let stackBarChartData = await stackedBarChartProcessData(combinedData);
  updateStackedBarChart(stackBarChartData, eventsData);

  //rank line chart
  let rankLineData = await rankLineChartProcessData(combinedData);
  updateLineChart(
    rankLineData,
    SvgRankLineChart,
    "Average Rank",
    (flip_y = true),
    eventsData, 
    selections
  );

  //stacked area chart
  updateAreaChart(lineChartData, SvgAreaChart, "Song Emotion Count", false, eventsData, selections);

  //legend - chatgpt helped with this
  const legendContainer = d3.select("#legend");
  const legend = legendContainer.append("div").attr("class", "legend");

  for (const key of Object.keys(emotionColors)) {
    const color = emotionColors[key];
    const legendItem = legend.append("div").attr("class", "legend-item");
    legendItem
      .append("div")
      .attr("class", "color-box")
      .style("background-color", color);
    legendItem.append("span").text(key);
  }

  // Checkable legend
  const checkableLegendContainer = d3.select("#checkable-legend");
  const checkableLegend = checkableLegendContainer.append("div").attr("class", "checkable-legend");

  for (const key of Object.keys(emotionColors)) {
    const color = emotionColors[key];
    const legendItem = checkableLegend.append("div").attr("class", "legend-item");
    legendItem
      .append("input")
      .attr("type", "checkbox")
      .attr("id", `checkbox-${key}`)
      .attr("checked", true)
      .on("change", function() {
        updateSelectedEmotions(lineChartData, SvgLineChart, eventsData);
      });
    legendItem
      .append("label")
      .attr("for", `checkbox-${key}`)
      .style("color", color)
      .text(key);
  }
}

/**
 * Creates an SVG element for a chart within a specified div.
 * @function createChartSVG
 * @param {string} chartId - The ID of the div element to append the SVG to.
 * @returns {Object} - The created SVG element.
 */
function createChartSVG(chartId) {
  return d3
    .select(chartId)
    .append("svg")
    .attr("height", CHART_HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("width", CHART_WIDTH + MARGIN.left + MARGIN.right)
    .append("g")
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
}

/**
 * creating slider for circle chart and adding listener for updates
 * @param {Array} data - The data to update circle chart with
 */
function createSliderForCircleChart(data) {
  const years = data.map((d) => d.year);
  let slider = document.getElementById("circle-slider");
  const min = Math.min(...years);
  slider.min = min;
  slider.max = Math.max(...years);
  slider.value = min;
  document.getElementById("circle-label").innerText = min;
  document.getElementById("circle-slider").value = min;
  slider.addEventListener("input", function () {
    document.getElementById("circle-label").innerText = this.value;
    updateCircleChart(data, this.value);
  });
}

/**
 * Loads JSON data from a specified file.
 * @async
 * @function loadData
 * @returns {Promise<Object>} - Returns a Promise with the loaded JSON data.
 */
async function loadData() {
  return fetch("data/combined_data_final.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error fetching the data - no response");
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

/**
 * Loads event data from csv.
 * @async
 * @function loadEventData
 * @returns {Promise<Array>} - Returns the loaded event data.
 */
async function loadEventData() {
  //assisted by copilot
  // Load historical events data
  const eventsResponse = await fetch("data/historical_events_1981_2020.csv");
  const eventsText = await eventsResponse.text();
  const eventsData = d3.csvParse(eventsText);

  // Parse event dates
  eventsData.forEach(event => {
    event.date = d3.timeParse("%Y-%m")(event.date);
  });

  return eventsData;
}

/**
 * Updates the line chart based on the selected emotions.
 * @function updateSelectedEmotions
 * @param {Array} data - The original data for the line chart.
 * @param {Object} SvgChart - The SVG element for the line chart.
 * @param {Array} eventsData - The historical events data.
 */
function updateSelectedEmotions(data, SvgChart, eventsData) {
  const selectedEmotions = Object.keys(emotionColors).filter(key => {
    return d3.select(`#checkbox-${key}`).property("checked");
  });

  const filteredData = data.filter(d => selectedEmotions.includes(d.label));
  updateLineChart(filteredData, SvgChart, "Song Emotion Count", false, eventsData, selections);
}

/**
 * Updates a line chart with provided data.
 * @function updateLineChart
 * @param {Array} data - The data to display in the line chart.
 * @param {Object} SvgChart - The SVG element for the line chart.
 * @param {string} y_axis_label - Label for the y-axis.
 * @param {boolean} flip_y - Whether to invert the y-axis scale.
 */
function updateLineChart(data, SvgChart, y_axis_label, flip_y, eventsData, selections) {
  //https://d3-graph-gallery.com/graph/line_basic.html

  console.log("Event data" + eventsData);

  //copilot helped me with this
  let xScale = d3
    .scalePoint()
    .domain(data.map((d) => d.year))
    .range([0, INNER_WIDTH]);

  //copilot helped me with this
  let yScale;
  if (flip_y) {
    yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .range([0, INNER_HEIGHT]);
  } else {
    yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .range([INNER_HEIGHT, 0]);
  }

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.count));

  SvgChart.selectAll("*").remove();

  //apending axis
  SvgChart.append("g")
    .attr("transform", "translate(0," + INNER_HEIGHT + " )")
    .attr("class", "xAxis")
    .call(d3.axisBottom(xScale).tickFormat((d, i) => (i % 2 === 0 ? d : "")));

  SvgChart.append("g").attr("class", "yAxis").call(d3.axisLeft(yScale));

  SvgChart.select(".xAxis path").attr("stroke", "white");

  SvgChart.selectAll(".xAxis .tick line").attr("stroke", "white");

  SvgChart.select(".yAxis path").attr("stroke", "white");

  SvgChart.selectAll(".yAxis .tick line").attr("stroke", "white");

  //copilot helped me with this
  for (const emotion of Object.keys(emotionColors)) {
    const emotionData = data.filter((d) => d.label === emotion);

    //creating line
    SvgChart.append("path")
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
  SvgChart.append("text")
    .attr("text-anchor", "middle")
    .attr("x", INNER_WIDTH / 2)
    .attr("y", INNER_HEIGHT + MARGIN.bottom)
    .text("Year");
  SvgChart.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -(INNER_HEIGHT / 2))
    .attr("y", -45)
    .text(y_axis_label);

  //copilot helped w this
  const eventOverlay = SvgChart.append("g").attr("class", "event-overlay");
  const yearWidth = INNER_WIDTH / (data.length - 1); // Width of each year segment

  eventOverlay.selectAll(".event-line")
    .data(eventsData)
    .enter()
    .append("line")
    .attr("class", "event-line")
    .attr("x1", (d) => xScale(d3.timeFormat("%Y")(d.date)))
    .attr("x2", (d) => xScale(d3.timeFormat("%Y")(d.date)))
    .attr("y1", 0)
    .attr("y2", INNER_HEIGHT)
    .attr("stroke", SPOTIFY_GREEN)
    .attr("stroke-width", 1);

  

    eventOverlay.selectAll(".event-dot")
    .data(eventsData)
    .enter()
    .append("circle")
    .attr("class", "event-dot")
    .attr("id", (d) => "dot-" + d.title)
    .attr("cx", (d) => xScale(d3.timeFormat("%Y")(d.date)))
    .attr("cy", 0)
    .attr("r", 7)
    .on("click", function (event, d) {
      selections = handleEventClick(d, eventOverlay,selections, this)
    })



}
/**
 * Shows the event modal with a title, description, and positions it relative to the mouse.
 * @function showModal
 * @param {string} title - The title to display in the modal.
 * @param {string} description - The description to display in the modal.
 */
function showModal(title, description, selections) {

 
  const modal = document.getElementById("event-modal");


  // Set modal content
  modal.querySelector(".modal-title").textContent = title;
  modal.querySelector(".modal-body").textContent = description;

  // Get the mouse position (clientX, clientY are relative to the viewport)
  const mouseX = window.event.clientX + window.pageXOffset; // Adjust for scrolling horizontally
  const mouseY = window.event.clientY + window.pageYOffset; // Adjust for scrolling vertically

  // Calculate modal position with a buffer
  const buffer = -250; // Space between the mouse pointer and the modal
  let modalLeft = mouseX + buffer - 150;
  let modalTop = mouseY + buffer - 160;

  // Prevent modal from going off the screen (adjust boundaries)
  const modalWidth = modal.offsetWidth;
  const modalHeight = modal.offsetHeight;

  // Check if the modal would go off the right side of the screen
  if (modalLeft + modalWidth > window.innerWidth + window.pageXOffset) {
    modalLeft = mouseX - modalWidth - buffer; // Move modal to the left of the pointer
  }

  // Check if the modal would go off the bottom of the screen
  if (modalTop + modalHeight > window.innerHeight + window.pageYOffset) {
    modalTop = mouseY - modalHeight - buffer; // Move modal above the pointer
  }

  // Apply calculated position
  modal.style.left = `${modalLeft}px`;
  modal.style.top = `${modalTop}px`;
  modal.style.position = "absolute";

  // Show the modal
  modal.style.display = "block";

  // Add event listener to close the modal
  const closeButton = modal.querySelector(".close"); // Assuming there's a close button in the modal
  closeButton.addEventListener("click", function() {
    // Change class of all D3 elements with class 'a' to class 'b'
    d3.selectAll(".event-dot-selected").attr("class", "event-dot").attr("r", 7)
    selections = "no"
    modal.style.display = "none"; // Hide the modal
  });

}

/**
 * Hides the event modal.
 * @function hideModal
 */
function hideModal() {
  const modal = document.getElementById("event-modal");
  modal.style.display = "none";
}
/**
 * Updates an area chart with provided data.
 * @function updateAreaChart
 * @param {Array} data - The data to display in the line chart.
 * @param {Object} SvgChart - The SVG element for the line chart.
 * @param {string} y_axis_label - Label for the y-axis.
 * @param {boolean} flip_y - Whether to invert the y-axis scale.
 */
function updateAreaChart(data, SvgChart, y_axis_label, flip_y, eventsData, selections) {
  //https://d3-graph-gallery.com/graph/line_basic.html

  //copilot helped me with this
  let xScale = d3
    .scalePoint()
    .domain(data.map((d) => d.year))
    .range([0, INNER_WIDTH]);

  let sum = data[0].count;
  let FirstEmote = data[0].label;
  let tempEmote = "";
  let i = 1;
  while (FirstEmote != tempEmote) {
    sum = sum + data[i].count;
    tempEmote = data[i + 1].label;
    i = i + 1;
  }

  //copilot helped me with this
  let yScale;
  if (flip_y) {
    yScale = d3.scaleLinear().domain([0, sum]).range([0, INNER_HEIGHT]);
  } else {
    yScale = d3.scaleLinear().domain([0, sum]).range([INNER_HEIGHT, 0]);
  }

  const cumulativeY = Array(data.length).fill(0);
  const minYear = d3.min(data, (d) => d.year);

  const areaGenerator = d3
    .area()
    .x((d) => xScale(d.year))
    .y0((d, i) => yScale(cumulativeY[d.year - minYear])) // Use cumulative y for y0
    .y1((d, i) => yScale(cumulativeY[d.year - minYear] + d.count)); // Stack current count on top

  SvgChart.selectAll("*").remove();

  //apending axis
  SvgChart.append("g")
    .attr("transform", "translate(0," + INNER_HEIGHT + " )")
    .attr("class", "xAxis")
    .call(d3.axisBottom(xScale).tickFormat((d, i) => (i % 2 === 0 ? d : "")));

  SvgChart.select(".xAxis path").attr("stroke", "white");

  SvgChart.selectAll(".xAxis .tick line").attr("stroke", "white");

  SvgChart.append("g").attr("class", "yAxis").call(d3.axisLeft(yScale));

  SvgChart.select(".yAxis path").attr("stroke", "white");

  SvgChart.selectAll(".yAxis .tick line").attr("stroke", "white");

  console.log(data)
  //copilot helped me with this
  for (const emotion of Object.keys(emotionColors)) {
    const emotionData = data.filter((d) => d.label === emotion);


    //creating line
    SvgChart.append("path")
      .datum(emotionData)
      .attr("fill", emotionColors[emotion])
      .attr("d", areaGenerator(emotionData));
    // Update cumulative values
    emotionData.forEach((d, i) => (cumulativeY[d.year - minYear] += d.count));
  }

  //adding axis labelså
  SvgChart.append("text")
    .attr("text-anchor", "middle")
    .attr("x", INNER_WIDTH / 2)
    .attr("y", INNER_HEIGHT + MARGIN.bottom)
    .text("Year");
  SvgChart.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -(INNER_HEIGHT / 2))
    .attr("y", -45)
    .text(y_axis_label);

    const eventOverlay = SvgChart.append("g").attr("class", "event-overlay");
    const yearWidth = INNER_WIDTH / (data.length - 1); // Width of each year segment
  
    eventOverlay.selectAll(".event-line")
      .data(eventsData)
      .enter()
      .append("line")
      .attr("class", "event-line")
      .attr("id",(d) =>  "line-" +d.title)
      .attr("x1", (d) => xScale(d3.timeFormat("%Y")(d.date)))
      .attr("x2", (d) => xScale(d3.timeFormat("%Y")(d.date)))
      .attr("y1", 0)
      .attr("y2", INNER_HEIGHT)
      .attr("stroke", SPOTIFY_GREEN)
      .attr("stroke-width", 1);
  
    
  
    eventOverlay.selectAll(".event-dot")
      .data(eventsData)
      .enter()
      .append("circle")
      .attr("class", "event-dot")
      .attr("id", (d) => "dot-" + d.title)
      .attr("cx", (d) => xScale(d3.timeFormat("%Y")(d.date)))
      .attr("cy", 0)
      .attr("r", 7)
      .on("click", function (event, d) {
        selections = handleEventClick(d, eventOverlay,selections, this)
      })

  
  
}

/**
 * This function contains all of the logic necessary for clicking on a historical event on the webpage. 
 * @param {*} element the svg element being clicked
 * @param {*} data the data of the svg element. 
 */
function handleEventClick(data, svg, selections, element)
{

  if (selections == element)
  {
     //deselct everything
     d3.selectAll(".event-dot-selected").attr("class", "event-dot").attr("r", 7)
     hideModal()
     return "no"
  }
  else
  {
     //deselct everything
     d3.selectAll(".event-dot-selected").attr("class", "event-dot").attr("r", 7);
    hideModal()

    //select the clicked element
    d3.select(element).attr("class", "event-dot-selected").attr("r", 20)
    showModal(data.title, data.description, selections)
    return element



  }

}



/**
 * Updates the circle chart with data for a specified year.
 * @function updateCircleChart
 * @param {Array} data - The data to display in the circle chart.
 * @param {number} value - The year to display in the circle chart.
 */
function updateCircleChart(data, value) {
  SvgCircle.selectAll("*").remove();

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
    const radius = 100 * emotionData.count;
    if (emotionData && emotionData.count > 0) {
      SvgCircle.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", radius)
        .attr("fill", emotionColors[pos.emotion])
        .attr("class", "circle")
        .attr("opacity", 1);

      const text = SvgCircle.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y + radius + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("opacity", 0)
        .text(
          pos.emotion +
            " - " +
            emotionData.count * emotionData.yearcount +
            " songs"
        );

      SvgCircle.append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", radius + 20)
        .attr("fill", "transparent")
        .on("mouseover", function () {
          text.attr("opacity", 1);
        })
        .on("mouseout", function () {
          text.attr("opacity", 0);
        });
    }
  });
}

/**
 * Processes data for the line chart by calculating yearly emotion counts.
 * @async
 * @function lineChartProcessData
 * @param {Array} data - The raw data to process.
 * @returns {Promise<Array>} - Returns a Promise with the processed data for the line chart.
 */
async function lineChartProcessData(data) {
  let emotionTotals = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    date.setDate(date.getDate() + 1);
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

/**
 * Processes data for the rank line chart by calculating yearly average ranks.
 * @async
 * @function rankLineChartProcessData
 * @param {Array} data - The raw data to process.
 * @returns {Promise<Array>} - Returns a Promise with the processed data for the rank line chart.
 */
async function rankLineChartProcessData(data) {
  let emotionRankTotals = {};
  let yearTotal = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const label = d.label;
    if (!emotionRankTotals[year]) {
      emotionRankTotals[year] = {};
      emotionRankTotals[year]["happy"] = 0;
      emotionRankTotals[year]["sad"] = 0;
      emotionRankTotals[year]["energetic"] = 0;
      emotionRankTotals[year]["calm"] = 0;
    }
    if (!yearTotal[year]) {
      yearTotal[year] = {};
      yearTotal[year]["happy"] = 0;
      yearTotal[year]["sad"] = 0;
      yearTotal[year]["energetic"] = 0;
      yearTotal[year]["calm"] = 0;
    }
    yearTotal[year][label] = yearTotal[year][label] + 1;
    emotionRankTotals[year][label] = emotionRankTotals[year][label] + +d.rank;
  });
  const musicTypeCount = [];
  for (const year in emotionRankTotals) {
    for (const label in emotionRankTotals[year]) {
      let averageRank;
      if (yearTotal[year][label] === 0) {
        averageRank = 100;
      } else {
        averageRank = emotionRankTotals[year][label] / yearTotal[year][label];
      }
      musicTypeCount.push({
        year: year,
        label: label,
        //getting average rank
        count: averageRank,
      });
    }
  }
  return musicTypeCount;
}

/**
 * Processes data for the circle chart by calculating the distribution of emotions by year.
 * @async
 * @function circleChartProcessData
 * @param {Array} data - The raw data to process.
 * @returns {Promise<Array>} - Returns a Promise with the processed data for the circle chart.
 */
async function circleChartProcessData(data) {
  let emotionTotals = {};
  let yearTotal = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    date.setDate(date.getDate() + 1);
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
  const musicTypeCount = [];
  for (const year in emotionTotals) {
    for (const label in emotionTotals[year]) {
      musicTypeCount.push({
        year: year,
        label: label,
        count: emotionTotals[year][label] / yearTotal[year],
        yearcount: yearTotal[year],
      });
    }
  }
  return musicTypeCount;
}

/**
 * Processes data for the stacked bar chart by calculating the distribution of emotions by year.
 * @async
 * @function stackedBarChartProcessData
 * @param {Array} data - The raw data to process.
 * @returns {Promise<Array>} - Returns a Promise with the processed data for the stacked bar chart.
 */
async function stackedBarChartProcessData(data) {
  let emotionTotals = {};
  let yearTotal = {};
  data.forEach((d) => {
    const date = new Date(d.date);
    date.setDate(date.getDate() + 1);
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
  const musicTypeCount = [];
  for (const year in emotionTotals) {
    musicTypeCount.push({
      year: year,
      happy: emotionTotals[year]["happy"] / yearTotal[year],
      sad: emotionTotals[year]["sad"] / yearTotal[year],
      energetic: emotionTotals[year]["energetic"] / yearTotal[year],
      calm: emotionTotals[year]["calm"] / yearTotal[year],
    });
  }
  return musicTypeCount;
}

/**
 * Updates the stacked bar chart with the provided data.
 * @function updateStackedBarChart
 * @param {Array} data - The data to display in the stacked bar chart.
 */
function updateStackedBarChart(data, eventsData) {
  // year - > happy, sad, energetic, calm
  SvgStackedBar.selectAll("*").remove();
  //got my example from
  //https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

  data.forEach(function (d) {
    d.count = +d.count;
  });

  var subgroups = ["happy", "sad", "energetic", "calm"];

  var groups = data.map((d) => d.year);

  var xScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, INNER_WIDTH])
    .padding([0.2]);

  var yScale = d3.scaleLinear().domain([0, 1]).range([INNER_HEIGHT, 0]);

  SvgStackedBar.append("g")
    .attr("transform", "translate(0," + INNER_HEIGHT + " )")
    .attr("class", "xAxis")
    .call(d3.axisBottom(xScale).tickFormat((d, i) => (i % 2 === 0 ? d : "")));

  SvgStackedBar.append("g").attr("class", "yAxis").call(d3.axisLeft(yScale));

  SvgStackedBar.select(".xAxis path").attr("stroke", "white");

  SvgStackedBar.selectAll(".xAxis .tick line").attr("stroke", "white");

  SvgStackedBar.select(".yAxis path").attr("stroke", "white");

  SvgStackedBar.selectAll(".yAxis .tick line").attr("stroke", "white");
  var color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range([
      emotionColors["happy"],
      emotionColors["sad"],
      emotionColors["energetic"],
      emotionColors["calm"],
    ]);

  var stackedData = d3.stack().keys(subgroups)(data);
  SvgStackedBar.append("g")
    .selectAll("g")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xScale(d.data.year);
    })
    .attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr("height", function (d) {
      return yScale(d[0]) - yScale(d[1]);
    })
    .attr("width", xScale.bandwidth())
    .on("mouseover", function (event, d) {
      SvgStackedBar.append("text")
        .attr("x", xScale(d.data.year) + xScale.bandwidth() / 2)
        .attr("y", yScale(d[1]) + 30)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("class", "hover")
        .text(`${d.data.year} : ${Math.round((d[1] - d[0]) * 100)}%`);
    })
    .on("mouseout", function () {
      // Remove label on mouse out
      SvgStackedBar.selectAll(".hover").remove();
    });

  //adding axis labels
  SvgStackedBar.append("text")
    .attr("text-anchor", "middle")
    .attr("x", INNER_WIDTH / 2)
    .attr("y", INNER_HEIGHT + MARGIN.bottom)
    .text("Year");
  SvgStackedBar.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -(INNER_HEIGHT / 2))
    .attr("y", -45)
    .text("Proprtion of Music Type");

}
