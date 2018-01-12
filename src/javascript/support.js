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

function countIndustry(vcdb, year) {
  return d3.nest()
  .key(function(d) {
    return d.victim.industry;
  })
  .rollup(function(v) {
    return v.length;
  })
  .entries(vcdb)
  // .object(vcdb.filter(function(d) {
    // return d.timeline.incident.year == year
  // }));
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
