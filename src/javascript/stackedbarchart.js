/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

function drawStackedBarChart(year) {

  // Assign approriate dataset to variable
  var dataset = barchartProperties.dataset[year][country]

  // Show error message to user when no data available
  if (dataset == null) {
    showError();
    return;
  }

  // Assign variables for local usage, and clearity
  var y = barchartProperties.y
  var x = barchartProperties.x
  var z = barchartProperties.z
  var svg = barchartProperties.svg
  var xAxis = barchartProperties.xAxis
  var yAxis = barchartProperties.yAxis
  var height = barchartProperties.height
  var width = barchartProperties.width;

  // Determine highest value in dataset
  var maxbarchartData = d3.max(dataset, function(d) {
    // Slicing string from d3.values array
    return d3.max(d3.values(d).slice(1, ));
  });

  // Determine lowest value in dataset
  var minbarchartData = d3.min(dataset, function(d) {
    // Slicing string from d3.values array
    return d3.min(d3.values(d).slice(1, ));
  });

  // Setting possible motvies
  var xData = ["Financial", "Other", "Unknown", "Grudge", "Fun",
    "Ideology", "Convenience", "Espionage", "Fear", "Secondary"
  ]

  // Keep track of actors/motives with a non-zero value
  var legendArray = []

  // Prepare dataset for later usage
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
        // Add motive index to legendArray if not yet present
        if (!legendArray.includes(xData.indexOf(c))) {
          legendArray.push(xData.indexOf(c))
        }
        // Return type of actor with corresponding motive and Y height
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
  y.domain([0, d3.max(dataStackLayout[dataStackLayout.length - 1], function(d) {
    return d.y0 + d.y;
  })]).nice();

  x.domain(dataStackLayout[0].map(function(d) {
    return d.x;
  }));

  // Bind data to .stack elements
  var layer = svg.selectAll('.stack')
    .data(dataStackLayout);

  // Add group elements
  var bars = layer.enter()
    .append('g')
    .attr('class', 'stack')
    .style('fill', function(d, i) {
      return z(i);
    });

  // Add rectangles to the barchart
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

  // Calling the X and Y axis
  d3.select('.xaxis')
    .call(xAxis);

  d3.select('.yaxis')
    .call(yAxis);

  // Update current rect's with new values
  layer.selectAll('rect')
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
    // Remove left over elements
    .exit().remove();

  // Calculating legend dimensions
  var dimensionsLegend = 15;

  // Bind new data to legend elements
  var legend = d3.select('.legendBarChart')
    .selectAll('g.legend')
    .data(legendArray.reverse());

  // Add new legend elements if neccessary
  var legendEnter = legend.enter()
    .append('g')
    .attr('class', 'legend');

  // Add rectangles to legend
  legendEnter.append('rect')
    .attr('width', dimensionsLegend)
    .attr('height', dimensionsLegend);

  // Add text to legend
  legendEnter.append('text')
    .attr('x', 25)
    .attr('y', 13);

  // Update exisiting rects
  legend.select('rect')
    .style('fill', z);

  // Update existing text
  legend.select('text')
    .text(function(d) {
      return xData[d];
    });

  // Position updated legend
  legend.attr('transform', function(d, i) {
    var height = 23;
    var offset = height * legendArray.length / 2;
    var horz = -30;
    var vert = i * height - offset;
    return 'translate(' + horz + "," + vert + ')';
  });

  // Remove not needed legend parts
  legend.exit().remove();
}
