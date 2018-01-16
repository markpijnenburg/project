window.onload = function() {
  queue()
    .defer(d3.json, "./vcdb.json")
    .await(initDashboard);
}

var country;

var donutUpdateNecessities = {};

function initDashboard(error, vcdb) {
  // console.log(prepareDataMap(vcdb, 2014))

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
    d3.select('.donutTitle').html("Top " + industryData.length + " Industries");

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

    path.on('mouseover', function(d) {
      donutTooltip.html("<b>Industry: </b>" + d.data.key + "<br><b>Nr. of incidents: </b>" + d.value)
      donutTooltip.style('display', 'block')
    });

    path.on('mouseout', function() {
      donutTooltip.style('display', 'none')
    });

    path.on('mousemove', function(d) {
      donutTooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX + 10) + 'px');
    })

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


    return donut;
  }


  var worldMap = initMap(2017)
  var donut = initDonut(2017)

  // Change map when year selected from dropdown
  d3.select("#dropdown_year")
    .on("change", function() {
      var year = d3.select("#dropdown_year").node().value;
      updateDashboard(vcdb, worldMap, country, year, donut)
    });

  d3.selectAll('.datamaps-subunit').on('click', function(geography) {
    if (geography.id in worldMap.options.data) {
      d3.select("h2").html(geography.properties.name);
      country = geography.id;
      var year = d3.select("#dropdown_year").node().value
      updateDashboard(vcdb, worldMap, country, year, donut)
    }
  })
}

function updateDashboard(vcdb, worldMap, country, year, donut) {
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

  function updateDonut(vcdb, donut, country, year) {
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

    donutUpdateNecessities.color.domain([minIndustryData, maxIndustryData]);
    donutUpdateNecessities.path = donutUpdateNecessities.path.data(donutUpdateNecessities.donut(industryData));
    donutUpdateNecessities.path.enter().append('path').attr('fill', function(d) {
      return donutUpdateNecessities.color(d.data.value);
    });

    donutUpdateNecessities.path.exit().remove();
    donutUpdateNecessities.path.attr("d", donutUpdateNecessities.arc);

    donutUpdateNecessities.legend = donutUpdateNecessities.legend.data(industryData)

    var legendEnter = donutUpdateNecessities.legend.enter().append('g')
    .attr('class', 'test');

    // console.log(donutUpdateNecessities['color'].domain())

    // var color = d3.scale.log()
    //   .domain([minIndustryData, maxIndustryData])
    //   .range(["#BBDEFB", "#0D47A1"])
    //   .interpolate(d3.interpolateHcl);

    // var arc = d3.svg.arc()
    //   .outerRadius(183.75)
    //   .innerRadius(100);

    // var path = d3.select('.gDonut').selectAll('path');
    // path = path.data(donut(industryData));
    // donutUpdateNecessities['path'].data(donut(industryData));

    // console.log(path)
    // console.log(donutUpdateNecessities['path'])
    // var path = donutUpdateNecessities['path']
    // console.log(industryData)
  }

  if (d3.select("#dropdown_year").node().value == year) {
    updateMap(vcdb, worldMap, year)
  }
  updateDonut(vcdb, donut, country, year);
  // console.log(donut)
}
