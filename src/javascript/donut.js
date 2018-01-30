/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

/*
Updates the donut chart accordingly to the new, selected dataset.
Also shows only up to the top 5 industries of the selected country.
*/
function drawDonut(vcdb, year) {
  // Prepare dataset for updating donut
  var industryData = countIndustry(vcdb, year, country)
  industryData.sort(function(x, y) {
    return d3.descending(x.value, y.value)
  });
  industryData = industryData.slice(0, 5)

  // Call error message when no data is available
  if (industryData.length == 0) {
    showError();
    return;
  }

  var svg = donutProperties.svg;
  var divWidth = donutProperties.divWidth;
  var divHeight = donutProperties.divHeight;
  var innerRadius = donutProperties.innerRadius;
  var outerRadius = donutProperties.outerRadius;

  // Change the text above the donut chart accordingly
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

  var color = d3.scale.log()
    .domain([minIndustryData, maxIndustryData])
    .range(["#BBDEFB", "#0D47A1"])
    .interpolate(d3.interpolateHcl);
  var arc = d3.svg.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);

  var path = svg.select(".gDonut").selectAll('path')
    .data(donut(industryData));

  var pathEnter = path.enter()
    .append('path')
    .attr('fill', '#F5F5F5');

  pathEnter.transition()
    .duration(1000)
    .attr('fill', function(d) {
      return color(d.data.value);
    })
    .attr('d', arc)
    .each(function(d) {
      this._current = d;
    });

  // Show tooltip on hovering the donut elements
  pathEnter.on('mouseover', mouseoverDonut);
  pathEnter.on('mouseout', mouseoutDonut);
  pathEnter.on('mousemove', mousemoveDonut);

  // updating
  path.select('path').transition()
    .duration(1000)
    .attr('fill', function(d) {
      return color(d.data.value);
    })
    .attr('d', donutProperties.arc)
    .each(function(d) {
      this._current = d;
    });

  // Remove old parts of donut and update "d" attribute
  path.exit().remove();
  path.attr("d", arc);
  path.attr('fill', function(d) {
    return color(d.data.value);
  });

  // Adding the legend to the donut SVG
  var dimensionsLegend = 15

  var legend = d3.select('.donutSVG')
    .select('.legendDonut')
    .attr('transform', 'translate(' + (widthVis / 2 - innerRadius / 2) + ',' + divHeight / 2 + ')')
    .selectAll('.legend').data(donut(industryData));

  var legendEnter = legend.enter().append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = 23;
      var offset = height * donut(industryData).length / 2;
      var horz = -10;
      var vert = i * height - offset;
      return 'translate(0,' + vert + ')';
    });

  legendEnter.append('rect')
    .attr('width', dimensionsLegend)
    .attr('height', dimensionsLegend)
    .style('fill', function(d) {
      return color(d.data.value)
    });

  legendEnter.append('text')
    .attr('x', 15 + 10)
    .attr('y', 23 - 10)
    .text(function(d) {
      return d.data.key;
    });

  legend.select('rect').style('fill', function(d) {
    return color(d.data.value);
  });

  legend.select('text').text(function(d) {
    return d.data.key;
  })

  legend.attr('transform', function(d, i) {
    var height = 23;
    var offset = height * donut(industryData).length / 2;
    var horz = 0;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

  legend.exit().remove();
}
