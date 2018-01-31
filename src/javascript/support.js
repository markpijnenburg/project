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
  // Do not filter on country if worldwide selected
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
  }
  // Filter on year and country
  else {
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

  // Determine lowest value from selectedData
  var lowestValue = d3.min(d3.values(selectedData));

  // Determine highest value from selectedData
  var highestValue = d3.max(d3.values(selectedData));

  // Colorscale based on lowest/highest value
  var paletteScale = d3.scale.log()
    .domain([lowestValue, highestValue])
    .range(["#BBDEFB", "#0D47A1"])
    .interpolate(d3.interpolateHcl);

  // Iterate through dataset
  for (var key in selectedData) {
    // Fill dataset with values and corresponding colors
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
  donutTooltip.html("<b>Industry: </b>" + d.data.key +
    "<br><b>Nr. of incidents: </b>" + d.value)
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
  barChartTooltip.html("<b>" + d.y +
    "</b> actors had <b>'" + d.m + "'</b> as motive.")
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
  bubbleTooltip.html("<b>Type: " + "</b>" +
    d[selectionBubble.slice(0, -1)] +
    "<br><b>Nr. of occurrences: " + "</b>" + d.value)
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
  d3.select('#snackbar').html("<b>" + countryFull +
    "</b> has no data available for <b>" + year +
    "</b>.<br>Please choose another country or year")
  toast.className = 'show';
  setTimeout(function() {
    toast.className = toast.className.replace('show', "");
  }, 3000);
}

/*
Show a toast notification on the bottom of the page when an error occurs while
loading datasets.
*/
function dataError() {
  var toast = document.getElementById('snackbar')
  d3.select('#snackbar').html("<b>Fatal error occured. Problems detected" +
    "while loading dataset.<br> Please try to refresh the page. </b>")
  toast.className = 'show';
  setTimeout(function() {
    toast.className = toast.className.replace('show', "");
  }, 3000);
}

/*
Calls the functions that are responsible for updating the visualizations.
*/
function updateDashboard(vcdb, worldMap, country, year) {

  // Call update functions with year or country with arguments
  updateMap(vcdb, worldMap, year)
  drawStackedBarChart(year)
  drawBubble(year)
  drawDonut(vcdb, year)

}

/*
Updates the global variables used for selecting and updating the datasets and
visualizations. Scrolls down to the bottom of the page when country is clicked.
*/
function updateGlobals(countryName, countryCode, vcdb) {

  // Select slider from DOM
  var slider = document.getElementById('myRange');

  // Assign arguments into variables
  countryFull = countryName;
  country = countryCode;

  // Check if new country is clicked
  if (slider.value == year) {
    visContainer.scrollIntoView({
      behaviour: 'smooth'
    });
  }

  // Update the year, text above slider and visualizations
  year = slider.value;
  d3.select('.sliderYear').html(year + ": " + countryFull);
  updateDashboard(vcdb, worldMap, country, year)
}
