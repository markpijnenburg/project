window.onload = function() {
  queue()
    .defer(d3.json, "src/vcdb.json")
    .defer(d3.json, "src/barchartdata.json")
    .defer(d3.json, "src/json/bubble.json")
    .await(initDashboard);
}

var country = "Worldwide";

var worldMap;

var selectionBubble = "assets"

var donutUpdateNecessities = {};

var barchartUpdateNecessities = {};

var bubbleSettings = {};

var widthVis;

var year;

function initDashboard(error, vcdb, barchartData, bubbleData) {
  widthVis = document.getElementById("container").offsetWidth / 3.33

  function initMap(year) {
    //https://github.com/markmarkoh/datamaps/blob/master/src/examples/highmaps_world.html

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
          // don't show tooltip if country don't present in dataset
          if (!data) {
            return;
          }
          // tooltip content
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

  function initDonut(year) {
    var divWidth = document.getElementById("donutId").offsetWidth;
    var divHeight = document.getElementById("donutId").offsetHeight;
    // console.log(divWidth)

    var industryData = countIndustry(vcdb, year, country)
    industryData.sort(function(x, y) {
      return d3.descending(x.value, y.value)
    });
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

    var donutWidth = widthVis / 1.5;
    // console.log(donutWidth)
    var donutHeight = divWidth / 2;
    var outerRadius = donutWidth / 2;
    var innerRadius = 100;
    var color = d3.scale.log()
      .domain([minIndustryData, maxIndustryData])
      .range(["#BBDEFB", "#0D47A1"])
      .interpolate(d3.interpolateHcl);

    var donutTooltip = d3.select('#donutId')
      .append('div')
      .attr('class', 'donutTooltip');

    var arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

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

    path.on('mouseover', mouseoverDonut);
    path.on('mouseout', mouseoutDonut);
    path.on('mousemove', mousemoveDonut);

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
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', function(d) {
        return color(d.data.value)
      });

    legend.append('text')
      .attr('x', 15 + 10)
      .attr('y', 23 - 10)
      .text(function(d) {
        return d.data.key;
      });

    donutUpdateNecessities["arc"] = arc;
    donutUpdateNecessities["donut"] = donut;
    donutUpdateNecessities["legend"] = legend;
    donutUpdateNecessities["path"] = path;
    donutUpdateNecessities["color"] = color;
    donutUpdateNecessities["divWidth"] = divWidth;
    donutUpdateNecessities["divHeight"] = divHeight;
    donutUpdateNecessities["innerRadius"] = innerRadius;

    return donut;
  }

  function initBarChart(year, barchartData) {
    var divWidth = document.getElementById("donutId").offsetWidth;
    var divHeight = document.getElementById("donutId").offsetHeight;

    var margin = {
      top: 20,
      right: 150,
      bottom: 50,
      left: 40
    }
    var width = divWidth - margin.left - margin.right
    var height = divHeight

    var barChartTooltip = d3.select('#barchartID')
      .append('div')
      .attr('class', 'barChartTooltip');

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .3);

    var y = d3.scale.linear().rangeRound([height, 0]);

    var z = d3.scale.category20();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    var svg = d3.select('#barchartID').append('svg').attr('class', 'barchartSVG')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('class', 'stacks')
      .attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    var xData = ["Financial", "Other", "Unknown", "Grudge", "Fun", "Ideology", "Convenience", "Espionage", "Fear", "Secondary"]
    var dataset = barchartData[year][country]

    var maxbarchartData = d3.max(dataset, function(d) {
      return d3.max(d3.values(d).slice(1, ));
    });

    var minbarchartData = d3.min(dataset, function(d) {
      return d3.min(d3.values(d).slice(1, ));
    });

    var legendArray = []

    var dataIntermediate = xData.map(function(c) {
      return dataset.map(function(d) {
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

    var dataStackLayout = d3.layout.stack()(dataIntermediate);

    // console.log(dataStackLayout)

    x.domain(dataStackLayout[0].map(function(d) {
      return d.x;
    }));

    y.domain([0, d3.max(dataStackLayout[dataStackLayout.length - 1], function(d) {
      return d.y0 + d.y;
    })]).nice();

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
      .on('mouseover', mouseoverBarChart)
      .on('mouseout', mouseoutBarChart)
      .on('mousemove', mousemoveBarChart);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', "translate(0," + height + ")")
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    var legendOffset = ((document.getElementById("barchartID").offsetHeight) - margin.bottom) / 2
    var legendWidth = ((document.getElementById("barchartID").offsetWidth) - margin.right)

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
        var horz = -20;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', z);

    legend.append('text')
      .attr('x', 15 + 10)
      .attr('y', 23 - 10)
      .text(function(d) {
        return xData[d];
      });

    barchartUpdateNecessities["dataset"] = barchartData;
    barchartUpdateNecessities["y"] = y;
    barchartUpdateNecessities["x"] = x;
    barchartUpdateNecessities["xAxis"] = xAxis;
    barchartUpdateNecessities["yAxis"] = yAxis;
    barchartUpdateNecessities["legend"] = legend;
    barchartUpdateNecessities["svg"] = svg;
    barchartUpdateNecessities["xData"] = xData;
    barchartUpdateNecessities["height"] = height;
    barchartUpdateNecessities['z'] = z;
    barchartUpdateNecessities['legendWidth'] = legendWidth;
    barchartUpdateNecessities['legendOffset'] = legendOffset;
  }

  function initBubble(year, bubbleData) {

    var divWidth = document.getElementById("container").offsetWidth;
    var divHeight = document.getElementById("bubbleID").offsetHeight;
    // console.log(divWidth / 3.33 * 0.8)

    var dataset = bubbleData[year][country].assets
    var diameter = divWidth / 3.33 * 0.8;
    var color = d3.scale.category20c();
    var bubble = d3.layout.pack().size([diameter - 30, diameter]).padding(1.5);

    var svg = d3.select("#bubbleID").append('svg').attr('width', diameter)
      .attr('height', diameter).attr('class', 'bubbleSVG');

    var bubbleTooltip = d3.select('#bubbleID')
      .append('div')
      .attr('class', 'bubbleTooltip');

    var nodes = bubble.nodes({
        children: dataset
      })
      .filter(function(d) {
        return !d.children;
      });

    // console.log(nodes)

    var bubbles = svg.selectAll('.bubble').data(nodes).enter().append('g')
      .attr('class', 'node');

    bubbles.append('circle')
      // .attr('class', 'node')
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
      .on('mouseover', mouseoverBubble)
      .on('mouseout', mouseoutBubble)
      .on('mousemove', mousemoveBubble);

    bubbles.append('text')
      .attr('x', function(d) {
        return d.x;
      })
      .attr('y', function(d) {
        return d.y;
      })
      .attr('text-anchor', 'middle')
      .text(function(d) {
        if (d.r > 45) {
          return d.asset;
        }
      });

    bubbleSettings['dataset'] = bubbleData;
    bubbleSettings['svg'] = svg;
    bubbleSettings['bubble'] = bubble;
  }

  initMap(2017)
  initDonut(2017)
  initBarChart(2017, barchartData)
  initBubble(2017, bubbleData)

  var visContainer = document.getElementById('visContainer');
  var slider = document.getElementById('myRange');
  year = slider.value;

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
  })

  $("input:radio").change(function() {
    selectionBubble = $(this).val()
    year = slider.value;
    updateDashboard(vcdb, worldMap, country, year)
  });


  slider.oninput = function() {
    var year = this.value;

    d3.select(".sliderYear").html(year);

    updateDashboard(vcdb, worldMap, country, year)
  }
}
