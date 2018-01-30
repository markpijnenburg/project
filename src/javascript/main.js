/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

// Load data and start script if window is loaded
window.onload = function() {
  queue()
    .defer(d3.json, "src/json/vcdb.json")
    .defer(d3.json, "src/json/barchartdata.json")
    .defer(d3.json, "src/json/bubble.json")
    .await(initDashboard);
}

// Init global variables used throughout functions
var worldMap;
var worldMapProperties = {};
var donutProperties = {};
var barchartProperties = {};
var bubbleProperties = {};
var widthVis;
var year = 2017;
var selectionBubble = "assets";
var country = "Worldwide";
var countryFull = "Worldwide";

/*
Main function called when page is loaded.
Initiates the dashboard and draws all the visualizations.
*/
function initDashboard(error, vcdb, barchartData, bubbleData) {

  // Determine width of page for auto scaling vis DIV's
  numberOfVis = 3.33
  widthVis = document.getElementById("container").offsetWidth / numberOfVis

  /*
  Initiates the worldmap with the default settings.
  These settings are currently the year 2017 and showing the wordwide data.
  */
  function initMap(year) {

    // Prepare dataset and determine highest value
    var dataset = prepareDataMap(vcdb, year);
    var selectedData = countIncidentsCountry(vcdb, year);
    var highestValue = d3.max(d3.values(selectedData));
    var svg = document.getElementById("worldmap");

    worldMap = new Datamap({
      element: svg,
      projection: 'mercator',
      data: dataset,
      fills: {
        defaultFill: '#DDD'
      },
      geographyConfig: {
        borderColor: '#B7B7B7',
        highlightBorderWidth: 1,
        highlightBorderColor: '#000000',
        highlightFillColor: function(geo) {
          return geo['fillColor'] || '#DDD';
        },
        popupTemplate: function(geo, data) {
          // Don't show tooltip if country not in dataset
          if (!data) {
            return;
          }
          // Content of tooltip
          return ['<div class="hoverinfo">',
            '<strong>', geo.properties.name, '</strong>',
            '<br>Number of incidents: <strong>', data.numberOfIncidents, '</strong>',
            '</div>'
          ].join('');
        }
      }
    });

    // Get dimensions of worldmap
    var mapHeight = document.getElementById("worldmap").offsetHeight - 50;
    var mapWidth = document.getElementById("worldmap").offsetWidth / 10;

    // Declare settings for gradient legend
    var gradientScale = d3.scale.linear()
      .domain([0, highestValue])
      .range([0, 160]);

    // Append legend to canvas
    var legendSVG = d3.select('.datamap').append('g')
      .attr('class', 'gradientLegend')
      .attr('width', 100)
      .attr('height', 40)
      .attr({
        transform: 'translate(120,' + 725 + ')'
      });

    // Define and call axis to DOM
    var xAxisGradient = d3.svg.axis().scale(gradientScale).ticks(3);
    var xAxisGroup = legendSVG.append('g')
      .attr('class', 'gradientAxis')
      .call(xAxisGradient);

    // Append gradient bar to SVG
    var defs = d3.select('.datamap').append('defs');
    var linearGradient = defs.append('linearGradient')
      .attr('id', 'linear-gradient')
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#DDDDDD");

    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0D47A1");

    // Add rect for gradient bar
    d3.select('.datamap').append("rect")
      .attr("width", 160)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)")
      .attr({
        transform: 'translate(120,' + mapHeight + ')'
      });

    // Add text for description to gradient bar
    d3.select('.datamap').append("text")
      .attr("class", "label")
      .style("font-size", "15px")
      .style("text-anchor", "middle")
      .text("Nr. of Security Incidents")
      .attr({
        transform: 'translate(' + mapWidth * 1.66 + "," + (mapHeight - 4) + ')'
      });

    // Store variables for updating usage
    worldMapProperties['gradientScale'] = gradientScale;
    worldMapProperties['xAxisGradient'] = xAxisGradient;

  }

  /*
  Creates the donut chart on the page with the default dataset.
  Default year is 2017 and the worldwide data.
  */
  function initDonut(year) {
    // Defining dimensions of donut
    var divWidth = document.getElementById("donutId").offsetWidth;
    var divHeight = document.getElementById("donutId").offsetHeight;
    var donutWidth = widthVis / 1.5;
    var donutHeight = divWidth / 2;
    var outerRadius = donutWidth / 2;
    var innerRadius = 100;
    var centreSvgOffset = 8;

    // Prepare tooltip div
    var donutTooltip = d3.select('#donutId')
      .append('div')
      .attr('class', 'donutTooltip');

    // Adding the canvas and G element to DOM
    var svg = d3.select('.donut')
      .append('svg')
      .attr({
        width: widthVis,
        height: divHeight,
        class: 'shadow donutSVG'
      }).attr({
        transform: 'translate(0,' + divHeight / centreSvgOffset + ')'
      });

    svg.append('g')
      .attr('class', 'gDonut')
      .attr({
        transform: 'translate(' + widthVis / 2 + ',' + divHeight / 2 + ')'
      });

    svg.append('g').attr('class', 'legendDonut');

    // Store variables for updating usage
    donutProperties["svg"] = svg;
    donutProperties["divWidth"] = divWidth;
    donutProperties["divHeight"] = divHeight;
    donutProperties["innerRadius"] = innerRadius;
    donutProperties["outerRadius"] = outerRadius;

    // Draw the initial donut chart
    drawDonut(vcdb, year);
  }

  /*
  Creates the stacked barchart on the page with the default dataset.
  Default year is 2017 and the worldwide data.
  */
  function initBarChart(year, barchartData) {

    // Defining dimensions of barchart
    var divHeight = document.getElementById("donutId").offsetHeight;
    var margin = {
      top: 20,
      right: 150,
      bottom: 50,
      left: 60
    };
    var width = widthVis - margin.left - margin.right;
    var height = divHeight;
    var xAxisOffset = 45;
    var yAxisOffset = -60;

    // Init tooltip DIV
    var barChartTooltip = d3.select('#barchartID')
      .append('div')
      .attr('class', 'barChartTooltip');

    // Defining scales for X and Y axis. Also color scale
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .3);
    var y = d3.scale.linear().rangeRound([height, 0]);
    var z = d3.scale.category20();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    // Adding empty SVG element to DOM
    var svg = d3.select('#barchartID').append('svg').attr('class', 'barchartSVG')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('class', 'stacks')
      .attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    // Settings and text for X axis
    svg.append('g')
      .attr('class', 'xaxis')
      .attr('transform', 'translate(0,' + height + ')')
      .append("text")
      .attr("class", "label")
      .attr("x", width / 2)
      .attr("y", xAxisOffset)
      .style("text-anchor", "middle")
      .text("Type of Actor");

    // Settings and text for Y axis
    svg.append('g')
      .attr('class', 'yaxis')
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", yAxisOffset)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .text("Total no. of actors");

    // Determine offset for legend placement
    var legendOffset = ((document.getElementById("barchartID").offsetHeight) - margin.bottom) / 2
    var legendWidth = ((document.getElementById("barchartID").offsetWidth) - margin.right)

    // Add grouping G element for legend parts
    var legend = d3.select('.barchartSVG').append('g')
      .attr("class", 'legendBarChart')
      .attr('transform', 'translate(' + legendWidth + ',' + legendOffset + ')');

    // Adding properties to global variable for updating
    barchartProperties["dataset"] = barchartData;
    barchartProperties["y"] = y;
    barchartProperties["x"] = x;
    barchartProperties["xAxis"] = xAxis;
    barchartProperties["yAxis"] = yAxis;
    barchartProperties["width"] = width;
    barchartProperties["svg"] = svg;
    barchartProperties["height"] = height;
    barchartProperties['z'] = z;

    // Draw initial stacked bar chart
    drawStackedBarChart(year, barchartData)
  }

  /*
  Creates the bubble chart on the page with the default dataset.
  Default year is 2017 and the worldwide data.
  */
  function initBubble(year, bubbleData) {

    // Calculate dimensions for bubble SVG and elements
    var divWidthContainer = document.getElementById("container").offsetWidth;
    var divWidth = document.getElementById("bubbleID").offsetWidth;
    var divHeight = document.getElementById("bubbleID").offsetHeight;
    var diameter = divWidthContainer / 3.33 * 0.8;
    var bubbleOffset = 40;
    var bubblePadding = 1.5;
    var xOffset = 45;
    var xDivide = 3.5;
    var yOffset = 10;
    var cyOffset = 1.4;

    // Define color scale
    var color = d3.scale.category10();
    var bubble = d3.layout.pack()
      .size([diameter - bubbleOffset, diameter - (bubbleOffset * 2.5)])
      .padding(bubblePadding);

    // Add empty SVG to Bubble DIV
    var svg = d3.select("#bubbleID").append('svg').attr('width', diameter)
      .attr('height', diameter).attr('class', 'bubbleSVG');

    // Init bubble tooltip DIV
    var bubbleTooltip = d3.select('#bubbleID')
      .append('div')
      .attr('class', 'bubbleTooltip');

    var radiusLegend = [10, 20, 40]
    var radiusLegendText = ["Few Incidents", "Some Incidents", "Many Incidents"]
    var bubbleLegend = d3.select('.bubbleSVG').selectAll('.bubbleLegend')
      .data(radiusLegend).enter().append('g')
      .attr('class', 'bubbleLegend');

    bubbleLegend.append('circle')
      .style('fill', 'lightgrey')
      .attr('r', function(d, i) {
        return d;
      })
      .attr('cx', function(d, i) {
        return i * (divWidth / xDivide) + xOffset;
      })
      .attr('cy', divHeight / cyOffset);

    bubbleLegend.append('text')
      .attr('x', function(d, i) {
        return i * (divWidth / xDivide) + xOffset;
      })
      .attr('y', diameter - yOffset)
      .attr('text-anchor', 'middle')
      .text(function(d, i) {
        return radiusLegendText[i];
      });

    // Adding properties to global variable for updating
    bubbleProperties['dataset'] = bubbleData;
    bubbleProperties['svg'] = svg;
    bubbleProperties['bubble'] = bubble;
    bubbleProperties['color'] = color;
    bubbleProperties['divWidth'] = divWidth;
    bubbleProperties['divHeight'] = divHeight;
    bubbleProperties['diameter'] = diameter;

    drawBubble(year);

  }

  // Calling the functions to draw the 4 visualizations
  initMap(year)
  initDonut(year)
  initBarChart(year, barchartData)
  initBubble(year, bubbleData)

  // Get positions of the lower visualizations
  var visContainer = document.getElementById('visContainer');

  // Get value of slider
  var slider = document.getElementById('myRange');
  year = slider.value;

  // Update dashboard when clicking on a country
  d3.selectAll('.datamaps-subunit').on('click', function(geography) {
    if (geography.id in worldMap.options.data) {
      countryFull = geography.properties.name;
      country = geography.id;
      year = slider.value;
      d3.select('.sliderYear').html(year + ": " + countryFull)
      visContainer.scrollIntoView({
        behaviour: 'smooth'
      });
      updateDashboard(vcdb, worldMap, country, year)
    }
  });

  d3.select('.worldWideButton').on('click', function() {
    countryFull = "Worldwide";
    country = "Worldwide";
    year = slider.value;
    d3.select('.sliderYear').html(year + ": " + countryFull);
    visContainer.scrollIntoView({
      behaviour: 'smooth'
    });
    updateDashboard(vcdb, worldMap, country, year)
  })

  // Update the bubble chart when switching radio button
  $("input:radio").change(function() {
    selectionBubble = $(this).val()
    year = slider.value;
    updateDashboard(vcdb, worldMap, country, year)
  });

  // Update the dashboard if slider is moved
  slider.oninput = function() {
    var year = this.value;
    d3.select('.sliderYear').html(year + ": " + countryFull)
    updateDashboard(vcdb, worldMap, country, year)
  };
}
