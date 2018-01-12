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
    // Change map when year selected from dropdown
    d3.select("#dropdown_year")
      .on("change", function() {
        var selectedDate = d3.select("#dropdown_year").node().value;
        updateDashboard(vcdb, worldMap, selectedDate)
      });
  }

  function initDonut(year){
    industryData = countIndustry(vcdb, year)
    console.log(industryData)
  }

  initMap(2017)
  initDonut(2017)

}

function updateDashboard(vcdb, worldMap, year){
  // console.log("updated")
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
  updateMap(vcdb, worldMap, year)
}
