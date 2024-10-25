// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 70, bottom: 40, top: 20, right: 20 };
const INNER_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const ANIMATION_DUATION = 300;

setup();

async function setup() {
  let combined_data = null;
  combined_data = await loadData();

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
}

function createChartSVG(chartId) {
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
