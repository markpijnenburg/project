/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren / University of Amsterdam
Visualizing IT Security Incidents
*/

/*
Updates the colors of the country's and data shown in tooltip.
Resets the choropleth for removing the old colors.
*/
function updateMap(vcdb, worldMap, year) {

  // Prepare dataset for correct usage
  var dataset = prepareDataMap(vcdb, year);
  var selectedData = countIncidentsCountry(vcdb, year);

  // Determine highest number of dataset for color scale
  var highestValue = d3.max(d3.values(selectedData));

  // Removing old data from choropleth
  worldMap.updateChoropleth(null, {
    reset: true
  });

  // Empty data of worldMap object before assinging new data
  worldMap.options.data = {};
  worldMap.options.geographyConfig.popupTemplate = function(geo, data) {
    // Do not show tooltip if country is not present in dataset
    if (geo.id in worldMap.options.data) {
      // Content of tooltip
      return ['<div class="hoverinfo">',
        '<strong>', geo.properties.name, '</strong>',
        '<br>Number of incidents: <strong>', data.numberOfIncidents, '</strong>',
        '</div>'
      ].join('');
    }
  }
  // Actually update choropleth with new data
  worldMap.updateChoropleth(dataset, {
    reset: true
  });

  // Update gradient legend on the worldmap
  worldMapProperties.gradientScale.domain([0, highestValue]);
  d3.select('.gradientAxis')
    .transition().duration(300)
    .call(worldMapProperties.xAxisGradient);
}
