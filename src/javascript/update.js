/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

/*
Main update function. Is called when a user interacts with the visualizations.
Updates all the visualizations on the dashboard if neccessary.
*/
function updateDashboard(vcdb, worldMap, country, year) {

  /*

  */
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

    d3.select('.donutTitle').html("Top " + industryData.length + " Industries");


    var maxIndustryData = d3.max(industryData, function(d) {
      return d.value;
    });
    var minIndustryData = d3.min(industryData, function(d) {
      return d.value;
    });
    donutProperties.color.domain([minIndustryData, maxIndustryData]);
    donutProperties.path = donutProperties.path.data(donutProperties.donut(industryData));
    donutProperties.path.enter().append('path').attr('fill', '#F5F5F5');
    donutProperties.path.transition()
      .duration(1000)
      .attr('fill', function(d) {
        return donutProperties.color(d.data.value);
      })
      .attr('d', donutProperties.arc)
      .each(function(d) {
        this._current = d;
      });

    donutProperties.path.exit().remove();
    donutProperties.path.attr("d", donutProperties.arc);

    var legend = d3.select('.legendDonut').selectAll('g.legend').data(industryData);
    var legendEnter = legend.enter().append('g').attr('class', 'legend');
    legendEnter.append('rect').attr('width', 15).attr('height', 15);
    legendEnter.append('text').attr('x', 25).attr('y', 13);
    legend.select('rect').style('fill', function(d) {
      return donutProperties.color(d.value)
    });
    legend.select('text').text(function(d) {
      return d.key;
    });
    legend.attr('transform', function(d, i) {
      var height = 23;
      var offset = height * donutProperties.donut(industryData).length / 2;
      var horz = 0;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

    legend.exit().remove();

    donutProperties.path.on('mouseover', mouseoverDonut);
    donutProperties.path.on('mouseout', mouseoutDonut);
    donutProperties.path.on('mousemove', mousemoveDonut);

  }

  function updateStackedBarChart(year) {
    var dataset = barchartProperties.dataset[year][country]

    if (dataset == null) {
      showError();
      return;
    }
    var xData = barchartProperties.xData
    var y = barchartProperties.y
    var x = barchartProperties.x
    var z = barchartProperties.z
    var svg = barchartProperties.svg
    var xAxis = barchartProperties.xAxis
    var yAxis = barchartProperties.yAxis
    var height = barchartProperties.height
    var legendWidth = barchartProperties.legendWidth
    var legendOffset = barchartProperties.legendOffset

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
      var horz = -30;
      var vert = i * height - offset;
      return 'translate('+ horz + "," + vert + ')';
    });

    legend.exit().remove();

  }

  function updateBubble(year) {

    var color = d3.scale.category20c();
    var bubble = bubbleProperties.bubble;
    var svg = bubbleProperties.svg;

    if (bubbleProperties.dataset[year][country] == undefined) {
      showError();
      return;
    }
    var dataset = bubbleProperties.dataset[year][country][selectionBubble]
    var nodes = bubble.nodes({
        children: dataset
      })
      .filter(function(d) {
        return !d.children;
      });
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
