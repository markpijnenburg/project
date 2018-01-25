function updateDashboard(vcdb, worldMap, country, year) {
  // console.log("TEST")
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

    if (industryData.length == 0) {
      showError();
      return;
    }

    // console.log(industryData.length)
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

    if (dataset == null) {
      showError();
      return;
    }

    // console.log(dataset)
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

    var legend = d3.select('.legendBarChart').selectAll('g.legend').data(legendArray.reverse());
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
      var horz = -10;
      var vert = i * height - offset;
      return 'translate(-20,' + vert + ')';
    });

    legend.exit().remove();

  }

  function updateBubble(year) {

    var color = d3.scale.category20c();
    var bubble = bubbleSettings.bubble;
    var svg = bubbleSettings.svg;

    if (bubbleSettings.dataset[year][country] == undefined) {
      showError();
      return;
    }
    var dataset = bubbleSettings.dataset[year][country][selectionBubble]


    // console.log(dataset)
    var nodes = bubble.nodes({
        children: dataset
      })
      .filter(function(d) {
        return !d.children;
      });
    // console.log(nodes)
    var node = d3.select('.bubbleSVG').selectAll('g.node').data(nodes);
    var nodeEnter = node.enter().append('g').attr('class', 'node');

    nodeEnter.append('circle').attr('r', function(d) {
        return d.r;
      }).attr('cx', function(d) {
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

    nodeEnter.append('text').attr('x', function(d) {
        return d.x;
      })
      .attr('y', function(d) {
        return d.y;
      })
      .attr('text-anchor', 'middle')

    node.select('circle').transition().duration(300)
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
      });

    node.select('text').text(function(d) {
        if (d.r > 45) {
          // console.log(selectionBubble)
          return d[selectionBubble.slice(0, -1)];
        }
      }).attr('x', function(d) {
        return d.x;
      })
      .attr('y', function(d) {
        return d.y;
      });

    node.exit().remove();

  }

  updateMap(vcdb, worldMap, year)
  updateDonut(vcdb, country, year);
  updateStackedBarChart(year);
  updateBubble(year);
}
