/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/


/*
Counts the number of incidents for each country.
Returns only the results for the selected year.
*/
function countIncidentsCountry(vcdb, year) {
  return d3.nest().key(function(d) {
      return d.victim.country[0];
    })
    .rollup(function(v) {
      return v.length;
    })
    .object(vcdb.filter(function(d) {
      return d.timeline.incident.year == year
    }));
}

/*
Counts the number of motives per data selection.
Return only the result of the chosen year.
*/
function dataBarchart(vcdb, year) {
  return d3.map()
    .rollup(function(v) {
      return v.length;
    })
    .object(vcdb.filter(function(d) {
      return d.timeline.incident.year == year
    }));
}

/*
Counts the occurrence of each industry.
Filtered by year and country.
*/
function countIndustry(vcdb, year, country) {
  if (country == "Worldwide") {
    return d3.nest()
      .key(function(d) {
        return d.victim.industry;
      })
      .rollup(function(v) {
        return v.length;
      })
      .entries(vcdb.filter(function(d) {
        return d.timeline.incident.year == year
      }));
  } else {
    return d3.nest()
      .key(function(d) {
        return d.victim.industry;
      })
      .rollup(function(v) {
        return v.length;
      })
      .entries(vcdb.filter(function(d) {
        return (d.timeline.incident.year == year && d.victim.country == country)
      }));
  }
}

/*
Prepares the dataset for coloring/updating the worldmap.
Using a logaritmic scale for determining the colors.
Returns a newly created dataset for the choropleth.
*/
function prepareDataMap(vcdb, year) {
  var dataset = {};
  var selectedData = countIncidentsCountry(vcdb, year);
  var lowestValue = d3.min(d3.values(selectedData));
  var highestValue = d3.max(d3.values(selectedData));
  var paletteScale = d3.scale.log()
    .domain([lowestValue, highestValue])
    .range(["#BBDEFB", "#0D47A1"])
    .interpolate(d3.interpolateHcl);
  for (var key in selectedData) {
    if (selectedData.hasOwnProperty(key)) {
      dataset[key] = {
        numberOfIncidents: selectedData[key],
        fillColor: paletteScale(selectedData[key])
      };
    }
  }
  return dataset;
}

/*
Show content of tooltip for donut chart.
*/
function mouseoverDonut(d) {
  var donutTooltip = d3.select('.donutTooltip');
  donutTooltip.html("<b>Industry: </b>" + d.data.key + "<br><b>Nr. of incidents: </b>" + d.value)
  donutTooltip.style('display', 'block')
}

/*
Keeps track of position tooltip when hovering donut.
*/
function mousemoveDonut(d) {
  var donutTooltip = d3.select('.donutTooltip');
  donutTooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

/*
Change style of tooltip when not hovering the visualization.
Removes tooltip for user.
*/
function mouseoutDonut(d) {
  var donutTooltip = d3.select('.donutTooltip');
  donutTooltip.style('display', 'none')
}

/*
Show content of tooltip for bar chart.
*/
function mouseoverBarChart(d) {
  var barChartTooltip = d3.select('.barChartTooltip');
  barChartTooltip.html("<b>" + d.y + "</b> actors had <b>'" + d.m + "'</b> as motive.")
  barChartTooltip.style('display', 'block')
}

/*
Keeps track of position tooltip when hovering bar chart.
*/
function mousemoveBarChart(d) {
  var barChartTooltip = d3.select('.barChartTooltip');
  barChartTooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

/*
Change style of tooltip when not hovering the visualization.
Removes tooltip for user.
*/
function mouseoutBarChart(d) {
  var barChartTooltip = d3.select('.barChartTooltip');
  barChartTooltip.style('display', 'none')
}

/*
Show content of tooltip for bubble chart.
*/
function mouseoverBubble(d) {
  var bubbleTooltip = d3.select('.bubbleTooltip');
  bubbleTooltip.html("<b>Type: " + "</b>" + d[selectionBubble.slice(0, -1)] + "<br><b>Nr. of occurrences: " + "</b>" + d.value)
  bubbleTooltip.style('display', 'block')
}

/*
Keeps track of position tooltip when hovering bubble chart.
*/
function mousemoveBubble(d) {
  var bubbleTooltip = d3.select('.bubbleTooltip');
  bubbleTooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

/*
Change style of tooltip when not hovering the visualization.
Removes tooltip for user.
*/
function mouseoutBubble(d) {
  var bubbleTooltip = d3.select('.bubbleTooltip');
  bubbleTooltip.style('display', 'none')
}

/*
Show a toast notification on the bottom of the page when no data available.
Called to inform user that visualizations are not updated.
*/
function showError() {
  var toast = document.getElementById('snackbar')
  year = document.getElementById('myRange').value;
  d3.select('#snackbar').html("<b>" + countryFull + "</b> has no data available for <b>" + year + "</b>.<br>Please choose another country or year")
  toast.className = 'show';
  setTimeout(function() {
    toast.className = toast.className.replace('show', "");
  }, 3000);
}

function updateDashboard(vcdb, worldMap, country, year) {

  // Call update functions with year or country with arguments
  updateMap(vcdb, worldMap, year)
  drawStackedBarChart(year)
  drawBubble(year)
  drawDonut(vcdb, year)

}
