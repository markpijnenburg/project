/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

function drawBubble(year) {

  // Calculate dimensions for bubble SVG and elements
  var dataset = bubbleProperties.dataset[year][country];

  // Show error to user when there is no data available
  if (bubbleProperties.dataset[year][country] == undefined) {
    showError();
    return;
  }

  // Assign local variables from global properties
  var color = bubbleProperties.color;
  var bubble = bubbleProperties.bubble;
  var svg = bubbleProperties.svg;
  var divWidth = bubbleProperties.divWidth;
  var divHeight = bubbleProperties.divHeight;
  var diameter = bubbleProperties.diameter;

  // Select approriate data and prepare for usage
  var nodes = bubble.nodes({
      children: dataset[selectionBubble]
    })
    .filter(function(d) {
      return !d.children;
    });

  // Bind data to elements
  var node = d3.select('.bubbleSVG').selectAll('g.node').data(nodes);

  // Adding the actual bubbles to the SVG
  var bubbles = node.enter().append('g')
    .attr('class', 'node');

  // Bind new data to node elements
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
      if (d.r > 50) {
        return d.asset;
      }
    });

  // Update exisiting bubbles
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

  // Updating text. Only add if it fits inside bubble
  node.select('text').text(function(d) {
      if (d.r > 50) {
        return d[selectionBubble.slice(0, -1)];
      }
    }).attr('x', function(d) {
      return d.x;
    })
    .attr('y', function(d) {
      return d.y;
    });

  // Remove unnecessary parts
  node.exit().remove();
}
