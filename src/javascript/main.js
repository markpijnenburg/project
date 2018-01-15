window.onload = function() {
  queue()
    .defer(d3.json, "./vcdb.json")
    .await(initDashboard);
}


function initDashboard(error, vcdb) {
  // console.log(vcdb)

  function initMap(year) {
    //https://github.com/markmarkoh/datamaps/blob/master/src/examples/highmaps_world.html

    var worldMap = new Datamap({
      element: document.getElementById("worldmap"),

      projection: 'mercator',
      done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
          if (geography.id in worldMap.options.data) {
            d3.select("h2").html(geography.properties.name);
            // console.log(selectedDate)
            updateDashboard(vcdb, worldMap, d3.select("#dropdown_year").node().value)
          }
        });
      },
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

  function initDonut(year){
    var divWidth = document.getElementById("donutId").offsetWidth;
    var divHeight = document.getElementById("donutId").offsetHeight;
    console.log(divWidth)
    console.log(divHeight)
    var industryData = countIndustry(vcdb, year)
    industryData.sort(function(x, y) {
      return d3.descending(x.value, y.value)
    });

    industryData = industryData.slice(0,5)
    d3.select('.donutTitle').html("Top " + industryData.length + " Industries");

    console.log(industryData.length)
    var maxIndustryData = d3.max(industryData, function(d) { return d.value; });
    var minIndustryData = d3.min(industryData, function(d) { return d.value; });

    var donut = d3.layout.pie()
                .value(function(d){return d.value})
                .padAngle(.03);

    var donutWidth = divWidth/2 + 50;
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
              .attr({width: divWidth,
                    height: divHeight,
                    class: 'shadow donutSVG'})
                    .append('g')
                    .attr({
                      transform: 'translate(' + divWidth / 2 + ',' + divHeight / 2 + ')'
                    });

    var path = svg.selectAll('path')
              .data(donut(industryData))
              .enter()
              .append('path')
              .attr({d:arc,
                    fill: function(d) {
                      return color(d.data.value);
                    }});

      path.transition()
    .duration(1000)
    .attrTween('d', function(d) {
        var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) {
            return arc(interpolate(t));
        };
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
      .style('left', (d3.event.layerX + 10) + 'px' );
    })

    var legend = d3.select('.donutSVG').append('g')
                 .attr('transform', 'translate(' + (divWidth / 2 - innerRadius / 2) + ',' + divHeight / 2 +')')
                 .selectAll('.legend')
                 .data(donut(industryData))
                 .enter()
                 .append('g')
                 .attr('class', 'legend')
                 .attr('transform', function(d, i) {
                  var height = 23;
                  var offset =  height * donut(industryData).length / 2;
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
          .text(function(d) { return d.data.key;});

    return donut;
  }


  var worldMap = initMap(2017)
  var donut = initDonut(2013)

  // console.log(worldMap)

  // Change map when year selected from dropdown
  d3.select("#dropdown_year")
    .on("change", function() {
      var selectedDate = d3.select("#dropdown_year").node().value;
      updateDashboard(vcdb, worldMap, donut, selectedDate)
    });

}

function updateDashboard(vcdb, worldMap, donut, year){
  console.log(donut)
  console.log(worldMap)
  function updateMap(vcdb, worldMap, year) {
      worldMap.updateChoropleth(null, {reset: true});
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
      worldMap.updateChoropleth(prepareDataMap(vcdb, year), {reset: true});
  }

  function updateDonut(vcdb, donut){
      donut.
  }
  updateMap(vcdb, worldMap, year)
}
