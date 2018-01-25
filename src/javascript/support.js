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

function dataBarchart(vcdb, year) {
  return d3.map()
  .rollup(function(v) {
    return v.length;
  })
  .object(vcdb.filter(function(d) {
    // console.log(d3.keys(d.actor)[0])
    // console.log(d)
    // return d3.keys(d.actor[0])
    // return d.actor.external.motive[0] == 'Ideology'
    return d.timeline.incident.year == year
  }));
}


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

function mouseoverDonut(d) {
  var donutTooltip = d3.select('.donutTooltip');
  donutTooltip.html("<b>Industry: </b>" + d.data.key + "<br><b>Nr. of incidents: </b>" + d.value)
  donutTooltip.style('display', 'block')
}

function mouseoutDonut(d) {
  var donutTooltip = d3.select('.donutTooltip');
  donutTooltip.style('display', 'none')
}

function mousemoveDonut(d) {
  var donutTooltip = d3.select('.donutTooltip');
  donutTooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

function mouseoverBarChart(d) {
  var barChartTooltip = d3.select('.barChartTooltip');
  barChartTooltip.html("<b>" + d.y + "</b> actors had <b>'" + d.m + "'</b> as motive.")
  barChartTooltip.style('display', 'block')
}

function mouseoutBarChart(d) {
  var barChartTooltip = d3.select('.barChartTooltip');
  barChartTooltip.style('display', 'none')
}

function mousemoveBarChart(d) {
  var barChartTooltip = d3.select('.barChartTooltip');
  barChartTooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

function mouseoverBubble(d) {
  var bubbleTooltip = d3.select('.bubbleTooltip');
  bubbleTooltip.html("<b>Type: " + "</b>" + d[selectionBubble.slice(0,-1)] + "<br><b>Nr. of occurrences: " + "</b>" + d.value)
  bubbleTooltip.style('display', 'block')
}

function mouseoutBubble(d) {
  var bubbleTooltip = d3.select('.bubbleTooltip');
  bubbleTooltip.style('display', 'none')
}

function mousemoveBubble(d) {
  var bubbleTooltip = d3.select('.bubbleTooltip');
  bubbleTooltip.style('top', (d3.event.layerY + 10) + 'px')
    .style('left', (d3.event.layerX + 10) + 'px');
}

function showError()
{
  var toast = document.getElementById('snackbar')
  var countryName = d3.select('.countryName')
  year = document.getElementById('myRange').value;
  d3.select('#snackbar').html("<b>" + countryName.text() + "</b> has no data available for <b>" + year + "</b>.<br>Please choose another country or year")
  toast.className = 'show';
  setTimeout(function(){ toast.className = toast.className.replace('show', ""); }, 3000);
}
