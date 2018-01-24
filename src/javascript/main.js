window.onload = function() {
  queue()
    .defer(d3.json, "src/vcdb.json")
    .defer(d3.json, "src/barchartdata.json")
    .defer(d3.json, "src/bubble.json")
    .await(initDashboard);
}

var country = "Worldwide";

var donutUpdateNecessities = {};

var barchartUpdateNecessities = {};

function initDashboard(error, vcdb, barchartData, bubbleData) {
  // console.log(bubble)
  function initMap(year) {
    //https://github.com/markmarkoh/datamaps/blob/master/src/examples/highmaps_world.html

    var worldMap = new Datamap({
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
    return worldMap;
  }

  function initDonut(year) {
    var divWidth = document.getElementById("donutId").offsetWidth;
    var divHeight = document.getElementById("donutId").offsetHeight;

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

    var donutWidth = divWidth / 2 + 50;
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
        width: divWidth,
        height: divHeight,
        class: 'shadow donutSVG'
      })
      .append('g')
      .attr('class', 'gDonut')
      .attr({
        transform: 'translate(' + divWidth / 2 + ',' + divHeight / 2 + ')'
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
      .attr('transform', 'translate(' + (divWidth / 2 - innerRadius / 2) + ',' + divHeight / 2 + ')')
      .selectAll('.legend')
      .data(donut(industryData))
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = 23;
        var offset = height * donut(industryData).length / 2;
        var horz = 0;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
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
    var country = 'USA'
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
        var horz = 0;
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
    console.log(bubbleData[year])
    bubbleData = bubbleData[year]
    var diameter = 300
    var format = d3.format(",d")
    var color = d3.scale.category20();

    var bubble = d3.layout.pack().size([diameter,diameter]).padding(1.5);

    var svg = d3.select('#bubbleID').append('svg')
    .attr('width', diameter)
    .attr('height', diameter)
    .attr('class', 'bubble');

    var node = svg.selectAll('.node')
    .data(bubble.nodes(bubbleData))
    .filter(function(d) { return !d.children; })
    .enter().append('g')
    .attr('class', 'node')
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

}

  var worldMap = initMap(2017)
  initDonut(2017)
  initBarChart(2017, barchartData)
  initBubble(2017, bubbleData)

  // Change map when year selected from dropdown
  d3.select("#dropdown_year")
    .on("change", function() {
      var year = d3.select("#dropdown_year").node().value;
      updateDashboard(vcdb, worldMap, country, year)
    });

  d3.selectAll('.datamaps-subunit').on('click', function(geography) {
    if (geography.id in worldMap.options.data) {
      d3.select("h2").html(geography.properties.name);
      country = geography.id;
      var year = d3.select("#dropdown_year").node().value
      updateDashboard(vcdb, worldMap, country, year)
    }
  })
}

function updateDashboard(vcdb, worldMap, country, year) {
  // console.log(donut)
  function updateMap(vcdb, worldMap, year) {
    worldMap.updateChoropleth(null, {
      reset: true
    });
    worldMap.options.data = {};
    worldMap.options.geographyConfig.popupTemplate = function(geo, data) {
      // don't show tooltip if country don't present in dataset
      if (geo.id in worldMap.options.data) {
        // tooltip content
        return ['<div class="hoverinfo">',
          '<strong>', geo.properties.name, '</strong>',
          '<br>Number of incidents: <strong>', data.numberOfIncidents, '</strong>',
          '</div>'
        ].join('');
      }
    }
    worldMap.updateChoropleth(prepareDataMap(vcdb, year), {
      reset: true
    });
  }

  function updateDonut(vcdb, country, year) {
    var industryData = countIndustry(vcdb, year, country)
    industryData.sort(function(x, y) {
      return d3.descending(x.value, y.value)
    });
    industryData = industryData.slice(0, 5)
    d3.select('.donutTitle').html("Top " + industryData.length + " Industries");


    var maxIndustryData = d3.max(industryData, function(d) {
      return d.value;
    });
    var minIndustryData = d3.min(industryData, function(d) {
      return d.value;
    });
    donutUpdateNecessities.color.domain([minIndustryData, maxIndustryData]);
    donutUpdateNecessities.path = donutUpdateNecessities.path.data(donutUpdateNecessities.donut(industryData));
    // console.log(donutUpdateNecessities.path)
    donutUpdateNecessities.path.enter().append('path').attr('fill', '#F5F5F5');
    donutUpdateNecessities.path.transition()
      .duration(1000)
      .attr('fill', function(d) {
        return donutUpdateNecessities.color(d.data.value);
      })
      .attr('d', donutUpdateNecessities.arc)
      .each(function(d) {
        this._current = d;
      });

    donutUpdateNecessities.path.exit().remove();
    donutUpdateNecessities.path.attr("d", donutUpdateNecessities.arc);

    var legend = d3.select('.legendDonut').selectAll('g.legend').data(industryData);
    var legendEnter = legend.enter().append('g').attr('class', 'legend');
    legendEnter.append('rect').attr('width', 15).attr('height', 15);
    legendEnter.append('text').attr('x', 25).attr('y', 13);
    legend.select('rect').style('fill', function(d) {
      return donutUpdateNecessities.color(d.value)
    });
    legend.select('text').text(function(d) {
      return d.key;
    });
    legend.attr('transform', function(d, i) {
      var height = 23;
      var offset = height * donutUpdateNecessities.donut(industryData).length / 2;
      var horz = 0;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

    legend.exit().remove();

    donutUpdateNecessities.path.on('mouseover', mouseoverDonut);
    donutUpdateNecessities.path.on('mouseout', mouseoutDonut);
    donutUpdateNecessities.path.on('mousemove', mousemoveDonut);

  }

  function updateStackedBarChart(year) {
    var dataset = barchartUpdateNecessities.dataset[year][country]
    var xData = barchartUpdateNecessities.xData
    var y = barchartUpdateNecessities.y
    var x = barchartUpdateNecessities.x
    var z = barchartUpdateNecessities.z
    var svg = barchartUpdateNecessities.svg
    var xAxis = barchartUpdateNecessities.xAxis
    var yAxis = barchartUpdateNecessities.yAxis
    var height = barchartUpdateNecessities.height
    var legendWidth = barchartUpdateNecessities.legendWidth
    var legendOffset = barchartUpdateNecessities.legendOffset

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

    y.domain([0, d3.max(dataStackLayout[dataStackLayout.length - 1], function(d) {
      return d.y0 + d.y;
    })]).nice();

    x.domain(dataStackLayout[0].map(function(d) {
      return d.x;
    }));

    // var updateBarChart = d3.select('.barchartSVG').data(dataStackLayout);
    // console.log(updateBarChart)
    var updateBarChart = svg.selectAll('.stack').data(dataStackLayout);

    updateBarChart.enter()
    .append('g')
    .attr('class', 'stack')
    .style('fill', function(d, i) {
      return z(i);
    });

    updateBarChart.selectAll('rect')
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
      .attr('width', x.rangeBand());

    updateBarChart.selectAll('rect')
      .data(function(d) {
        return d;
      })
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
      .on('mousemove', mousemoveBarChart).exit().remove();

    d3.select('.barchartSVG').select('.x.axis').transition().duration(300).call(xAxis)
    d3.select('.barchartSVG').select('.y.axis').transition().duration(300).call(yAxis)

    var legend = d3.select('.barchartSVG')
      .selectAll('.legend')
      .data(legendArray.reverse())

    var legend = d3.select('.legendBarChart').selectAll('g.legend').data(legendArray);
    var legendEnter = legend.enter().append('g').attr('class', 'legend');
    legendEnter.append('rect').attr('width', 15).attr('height', 15);
    legendEnter.append('text').attr('x', 25).attr('y', 13);
    legend.select('rect').style('fill', z);
    legend.select('text').text(function(d) {
      return xData[d];
    });
    legend.attr('transform', function(d, i) {
      var height = 23;
      var offset = height * legendArray.length / 2;
      var horz = 0;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

    legend.exit().remove();

  }

  if (d3.select("#dropdown_year").node().value == year) {
    updateMap(vcdb, worldMap, year)
  }
  updateDonut(vcdb, country, year);
  updateStackedBarChart(year, country);
}
