/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

// Load data and start script if window is loaded
window.onload = function() {
  queue()
    .defer(d3.json, "src/vcdb.json")
    .defer(d3.json, "src/barchartdata.json")
    .defer(d3.json, "src/json/bubble.json")
    .await(initDashboard);
}

// Init global variables used throughout functions
var worldMap;
var donutProperties = {};
var barchartProperties = {};
var bubbleProperties = {};
var widthVis;
var year;
var selectionBubble = "assets"
var country = "Worldwide";

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
    worldMap = new Datamap({
      element: document.getElementById("worldmap"),
      projection: 'mercator',
      data: prepareDataMap(vcdb, year),
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

    var mapHeight = document.getElementById("worldmap").offsetHeight - 50;
    var mapWidth = document.getElementById("worldmap").offsetWidth / 10;
    var gradientScale = d3.scale.linear().domain([0, 167]).range([0, 160]);

    var legendSVG = d3.select('.datamap').append('g')
      .attr('class', 'gradientLegend')
      .attr('width', 100)
      .attr('height', 40)
      .attr({
        transform: 'translate(120,' + 725 + ')'
      });

    var xAxisGradient = d3.svg.axis().scale(gradientScale).ticks(3);

    var xAxisGroup = legendSVG.append('g')
      .attr('class', 'gradientAxis')
      .call(xAxisGradient)

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

    d3.select('.datamap').append("rect")
      .attr("width", 160)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)")
      .attr({
        transform: 'translate(120,' + mapHeight + ')'
      });

    d3.select('.datamap').append("text")
      .attr("class", "label")
      .style("font-size", "15px")
      .style("text-anchor", "middle")
      .text("Nr. of Security Incidents")
      .attr({
        transform: 'translate(' + mapWidth * 1.66 + "," + (mapHeight - 4) + ')'
      });
  }

  /*
  Creates the donut chart on the page with the default dataset.
  Default year is 2017 and the worldwide data.
  */
  function initDonut(year) {
    var divWidth = document.getElementById("donutId").offsetWidth;
    var divHeight = document.getElementById("donutId").offsetHeight;

    // Preparing the data for usage
    var industryData = countIndustry(vcdb, year, country)
    industryData.sort(function(x, y) {
      return d3.descending(x.value, y.value)
    });

    // Only show up to the top 5 industries
    industryData = industryData.slice(0, 5)

    var maxIndustryData = d3.max(industryData, function(d) {
      return d.value;
    });
    var minIndustryData = d3.min(industryData, function(d) {
      return d.value;
    });

    var donut = d3.layout.pie()
      .value(function(d) {
        return d.value
      })
      .padAngle(.03);

    // Defining dimensions of donut
    var donutWidth = widthVis / 1.5;
    var donutHeight = divWidth / 2;
    var outerRadius = donutWidth / 2;
    var innerRadius = 100;
    var color = d3.scale.log()
      .domain([minIndustryData, maxIndustryData])
      .range(["#BBDEFB", "#0D47A1"])
      .interpolate(d3.interpolateHcl);

    // Prepare tooltip div
    var donutTooltip = d3.select('#donutId')
      .append('div')
      .attr('class', 'donutTooltip');

    var arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

    // Adding the actual elements to the DOM
    var svg = d3.select('.donut')
      .append('svg')
      .attr({
        width: widthVis,
        height: divHeight,
        class: 'shadow donutSVG'
      }).attr({
        transform: 'translate(0,' + divHeight / 8 + ')'
      })
      .append('g')
      .attr('class', 'gDonut')
      .attr({
        transform: 'translate(' + widthVis / 2 + ',' + divHeight / 2 + ')'
      });

    var path = svg.selectAll('path')
      .data(donut(industryData))
      .enter()
      .append('path')
      .attr('fill', '#F5F5F5');

    path.transition()
      .duration(1000)
      .attr('fill', function(d) {
        return color(d.data.value);
      })
      .attr('d', arc)
      .each(function(d) {
        this._current = d;
      });

    // Show tooltip on hovering the donut elements
    path.on('mouseover', mouseoverDonut);
    path.on('mouseout', mouseoutDonut);
    path.on('mousemove', mousemoveDonut);

    // Adding the legend to the donut SVG
    var dimensionsLegend = 15
    var legend = d3.select('.donutSVG').append('g')
      .attr("class", 'legendDonut')
      .attr('transform', 'translate(' + (widthVis / 2 - innerRadius / 2) + ',' + divHeight / 2 + ')')
      .selectAll('.legend')
      .data(donut(industryData))
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = 23;
        var offset = height * donut(industryData).length / 2;
        var horz = -10;
        var vert = i * height - offset;
        return 'translate(0,' + vert + ')';
      });

    legend.append('rect')
      .attr('width', dimensionsLegend)
      .attr('height', dimensionsLegend)
      .style('fill', function(d) {
        return color(d.data.value)
      });

    legend.append('text')
      .attr('x', 15 + 10)
      .attr('y', 23 - 10)
      .text(function(d) {
        return d.data.key;
      });

    // Adding neccessary data to global variable for updating
    donutProperties["arc"] = arc;
    donutProperties["donut"] = donut;
    donutProperties["legend"] = legend;
    donutProperties["path"] = path;
    donutProperties["color"] = color;
    donutProperties["divWidth"] = divWidth;
    donutProperties["divHeight"] = divHeight;
    donutProperties["innerRadius"] = innerRadius;

  }

  /*
  Creates the stacked barchart on the page with the default dataset.
  Default year is 2017 and the worldwide data.
  */
  function initBarChart(year, barchartData) {
    // var divWidth = document.getElementById("donutId").offsetWidth;
    // var divWidth = widthVis

    // Defining dimensions of barchart
    var divHeight = document.getElementById("donutId").offsetHeight;
    var margin = {
      top: 20,
      right: 150,
      bottom: 50,
      left: 40
    }
    var width = widthVis - margin.left - margin.right
    var height = divHeight

    // Init tooltip DIV
    var barChartTooltip = d3.select('#barchartID')
      .append('div')
      .attr('class', 'barChartTooltip');

    // Defineing scales for X and Y axis. Also color scale
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

    // Preparing the dataset for enter/append
    var xData = ["Financial", "Other", "Unknown", "Grudge", "Fun", "Ideology", "Convenience", "Espionage", "Fear", "Secondary"]
    var dataset = barchartData[year][country]

    var maxbarchartData = d3.max(dataset, function(d) {
      return d3.max(d3.values(d).slice(1, ));
    });

    var minbarchartData = d3.min(dataset, function(d) {
      return d3.min(d3.values(d).slice(1, ));
    });

    // Keep track of actors/motives with a non-zero value
    var legendArray = []

    var dataIntermediate = xData.map(function(c) {
      return dataset.map(function(d) {
        // Set Y height to zero if no data available
        if (d[c] == null) {
          return {
            x: d.actor,
            y: 0,
            m: "Unknown"
          };
        } else {
          if (!legendArray.includes(xData.indexOf(c))) {
            legendArray.push(xData.indexOf(c))
          }
          return {
            x: d.actor,
            y: d[c],
            m: c
          };
        }
      });
    });

    // Convert data to usable stacked layout
    var dataStackLayout = d3.layout.stack()(dataIntermediate);

    // Define X and Y domain
    x.domain(dataStackLayout[0].map(function(d) {
      return d.x;
    }));

    y.domain([0, d3.max(dataStackLayout[dataStackLayout.length - 1], function(d) {
      return d.y0 + d.y;
    })]).nice();

    // Appending the actual elements to the DOM
    var layer = svg.selectAll('.stack')
      .data(dataStackLayout)
      .enter()
      .append('g')
      .attr('class', 'stack')
      .style('fill', function(d, i) {
        return z(i);
      });

    layer.selectAll('rect')
      .data(function(d) {
        return d;
      })
      .enter()
      .append('rect')
      .attr('x', function(d) {
        return x(d.x);
      })
      .attr('y', function(d) {
        return y(d.y + d.y0);
      })
      .attr('height', function(d) {
        return y(d.y0) - y(d.y + d.y0);
      })
      .attr('width', x.rangeBand())
      // Show tooltip when hovering elements
      .on('mouseover', mouseoverBarChart)
      .on('mouseout', mouseoutBarChart)
      .on('mousemove', mousemoveBarChart);

    // Adding X and Y axis to the DOM
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', "translate(0," + height + ")")
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    // Calculating legend dimensions
    var legendOffset = ((document.getElementById("barchartID").offsetHeight) - margin.bottom) / 2
    var legendWidth = ((document.getElementById("barchartID").offsetWidth) - margin.right)

    // Adding the legend rect's and text
    var dimensionsLegend = 15
    var legend = d3.select('.barchartSVG').append('g')
      .attr("class", 'legendBarChart')
      .attr('transform', 'translate(' + legendWidth + ',' + legendOffset + ')')
      .selectAll('.legend')
      .data(legendArray.reverse())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = 23;
        var offset = height * legendArray.length / 2;
        var horz = -30;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', dimensionsLegend)
      .attr('height', dimensionsLegend)
      .style('fill', z);

    legend.append('text')
      .attr('x', dimensionsLegend + 10)
      .attr('y', 23 - 10)
      .text(function(d) {
        return xData[d];
      });

    // Adding properties to global variable for updating
    barchartProperties["dataset"] = barchartData;
    barchartProperties["y"] = y;
    barchartProperties["x"] = x;
    barchartProperties["xAxis"] = xAxis;
    barchartProperties["yAxis"] = yAxis;
    barchartProperties["legend"] = legend;
    barchartProperties["svg"] = svg;
    barchartProperties["xData"] = xData;
    barchartProperties["height"] = height;
    barchartProperties['z'] = z;
    barchartProperties['legendWidth'] = legendWidth;
    barchartProperties['legendOffset'] = legendOffset;
  }

  /*
  Creates the bubble chart on the page with the default dataset.
  Default year is 2017 and the worldwide data.
  */
  function initBubble(year, bubbleData) {

    // Calculate dimensions for bubble SVG and elements
    var divWidth = document.getElementById("container").offsetWidth;
    var divHeight = document.getElementById("bubbleID").offsetHeight;
    var diameter = divWidth / 3.33 * 0.8;
    var bubbleOffset = 40;
    var bubblePadding = 1.5;

    // Select proper data from dataset
    var dataset = bubbleData[year][country].assets

    // Define color scale
    var color = d3.scale.category20c();

    var bubble = d3.layout.pack().size([diameter - bubbleOffset, diameter]).padding(bubblePadding);

    // Add empty SVG to Bubble DIV
    var svg = d3.select("#bubbleID").append('svg').attr('width', diameter)
      .attr('height', diameter).attr('class', 'bubbleSVG');

    // Init bubble tooltip DIV
    var bubbleTooltip = d3.select('#bubbleID')
      .append('div')
      .attr('class', 'bubbleTooltip');

    // Prepare dataset nodes for usage
    var nodes = bubble.nodes({
        children: dataset
      })
      .filter(function(d) {
        return !d.children;
      });

    // Adding the actual bubbles to the SVG
    var bubbles = svg.selectAll('.bubble').data(nodes).enter().append('g')
      .attr('class', 'node');

    bubbles.append('circle')
      .attr('r', function(d) {
        return d.r;
      })
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })
      .style('fill', function(d) {
        return color(d[selectionBubble.slice(0, -1)]);
      })
      // Show tooltip when hovering bubbles
      .on('mouseover', mouseoverBubble)
      .on('mouseout', mouseoutBubble)
      .on('mousemove', mousemoveBubble);

    // Adding text inside the bubble
    bubbles.append('text')
      .attr('x', function(d) {
        return d.x;
      })
      .attr('y', function(d) {
        return d.y;
      })
      .attr('text-anchor', 'middle')
      .text(function(d) {
        // Only add text if it fits inside bubble
        if (d.r > 45) {
          return d.asset;
        }
      });

    // Adding properties to global variable for updating
    bubbleProperties['dataset'] = bubbleData;
    bubbleProperties['svg'] = svg;
    bubbleProperties['bubble'] = bubble;
  }

  // Calling the functions to draw the 4 visualizations
  initMap(2017)
  initDonut(2017)
  initBarChart(2017, barchartData)
  initBubble(2017, bubbleData)

  // Get positions of the lower visualizations
  var visContainer = document.getElementById('visContainer');

  // Get value of slider
  var slider = document.getElementById('myRange');
  year = slider.value;

  // Update dashboard when clicking on a country
  d3.selectAll('.datamaps-subunit').on('click', function(geography) {
    if (geography.id in worldMap.options.data) {
      d3.select("h2").html(geography.properties.name);
      country = geography.id;
      year = slider.value;
      visContainer.scrollIntoView({
        behaviour: 'smooth'
      });

      updateDashboard(vcdb, worldMap, country, year)
    }
  });

  // Update the bubble chart when switching radio button
  $("input:radio").change(function() {
    selectionBubble = $(this).val()
    year = slider.value;

    updateDashboard(vcdb, worldMap, country, year)
  });

  // Update the dashboard if slider is moved
  slider.oninput = function() {
    var year = this.value;
    d3.select(".sliderYear").html(year);

    updateDashboard(vcdb, worldMap, country, year)
  };
}
