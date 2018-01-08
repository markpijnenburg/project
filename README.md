# Visualizing Security Incidents  | Minor Programmeren | UvA
## Author
* Mark Pijnenburg

## Summary (visualization goals)

The goal of this visualization is to give cyber security experts and interested people insight into security incidents over the past couple years around the world.

This repository will ultimately contain the final product, report, process book and other materials, for assessing the project. (Work in progress)

## Project proposal
### Problem statement
Nowadays, there is a lot going on about cyber security and hacking. Unfortunately there are not many easy to use cyber security visualizations or datasets available. IT professionals specialized in cyber security, or just  interested people, have difficulties to get an easy overview of the topic. They are assigned to closed source visualizations from big security companies, where the source data is not available.

### Solution
This visualization project aims to provide the target audience insight in cyber security around the globe, based on open source data.

![](doc/sketch.png)

**Main Features**
* See total security incidents per country when hovering world map;

  (When clicking a country)
  * Show distribution by industry for country (pie chart);
  * Show the type of actors and their motives for country (bar chart);
  * Show the number of assets and actions in a heat map table for country.

If another country on the map is clicked, the other visualizations are updated with that data. On top of the page there is a drop-down menu to select a specific year from the dataset. The second interactive element is also a drop-down menu, where a user can select which actors to show in the barchart.

When hovering a country on the map, a tooltip should show with the total number of security incidents of that country.

**Minimum Viable Product**

The world map, pie chart and bar chart as described above are a minimum viable product. If possible, I want to create a stacked bar chart. The heatmap is also a nice visualization, but I do not know if I am capable to create it.

In total there are two drop-down menu's. These are the two required interactive components. On top of the page is a drop-down menu to select a specific year from the dataset. The other drop-down is used to select a specific type of actor to show in the barchart.

### Prerequisites
**Data Source**

[VCDB Github](https://github.com/vz-risk/VCDB)

The data is available in JSON, so I do not need to edit the data before using. Possibly I need to map/nest the data within my JavaScript for some visualizations or additional information.

**External Components**

* [D3-tip](https://github.com/caged/d3-tip)
* [D3Plus](https://d3plus.org/)
* [TopoJSON](https://github.com/topojson/topojson)
* [Bootstrap](https://getbootstrap.com/)

**Review of similar/related visualizations**

The most cyber security related visualizations represent live attacks around the world, where the majority of them is based on closed source data. (https://www.fireeye.com/cyber-map/threat-map.html)

When there is an world map involved, hovering a country shows more detailed information. Some visualizations are able to show even more information when a country is clicked, whereas some just show a world map with bouncing lines.

Almost everyone uses some kind of JavaScript library, and some even D3. I can do some things in the same way as others do, like the hovering and clicking of a country on a world map.

The thing I mainly miss is a "dashboard" kind of feeling, with multiple visualizations on one page, giving insight about cyber incidents over multiple year. The majority of visualizations is real-time.

**Hard parts to implement**

I have some parts of my visualization idea that prove to be difficult:
* Updating/linking the multiple visualizations;
* Mapping/nesting the data so I could use it for my purpose;
* (Stacked) bar chart and a heat map table.

Especially the new visualizations I never made during the previous course could be difficult to implement. If the new visualizations tend to be too difficult, I could revert to a normal bar chart and a normal table, without the heat map. But with the help of the internet and the staff at UvA I could overcome that problem.

The linking/updating/mapping/nesting can be fixed by using the JSON file correctly and implementing the updating via the D3 general update pattern. (Enter, update, exit)
