# Visualizing Security Incidents  | Minor Programmeren | UvA

## Description
This GitHub repository contains a D3 visualization for the final project of the minor Programming at the University of Amsterdam. The visualization aims to offer an interactive overview of IT Security Incidents around the world, for multiple years. It gives a user insight about the affected industries, the actors and their motives and finally the used actions and compromised assets.

The visualization is for Cyber Security professionals, but also usable for other people interested in the topic. I made this visualization because there are not many interactive dashboard available, based on open-source data.

![Sketch](doc/capture_visualization.png)

## Technical design
### High-level overview
#### JavaScript
In total, I have six self written JavaScript files. Each visualization has his own file. Besides that, there is also a main.js and a support.js that handle the supportive functions and declaring the canvas properties for the visualizations. Below is a short high-level overview for each JavaScript file.

**main.js**

Loads the JSON files and starts the initialization of the visualizations when the page is loaded in the browser. Declares multiple global variables that are later used for drawing and updating the visualizations on user input. Only the initial worldmap is created from the code in this file. The other elements for the remaining visualizations are not created, except the SVG canvases. The prepared settings for the visualizations are stored in the global variables. At the end of the main.js file are multiple D3 selections that notice user input and trigger the update of the dataset and visualizations accordingly.

**support.js**

Contains only functions that support the other JavaScript files. Mostly preparing dataset for usage in drawing and updating the visualizations. For each visualization there are multiple functions declared that are called when hovering the parts of the visualizations and show the tooltip. If a user chooses a combination of year/country that does not exist in the dataset, a error function is called. This function is also declared in the support.js file. The last function in this JavaScript file is an update function that just calls the appropriate functions when the visualizations need to be updated.


**worldmap.js**

Responsible for the updating of the worldmap. Because I use datamaps for the worldmap, not much code is needed. File prepares the dataset and calls the built-in update function of datamaps.

**donut.js**

Draws the initial donut chart but is also used for updating the existing donut. Also adds and updates the legend in the center of the donut. Calls error function if no available data is present.

**stackedbarchart.js**

Select the appropriate dataset and checks if it is available, otherwise call the error function. Appends and updates the bars and legend. Removes old elements if necessary.


**bubble.js**

Tries to select the appropriate dataset and call error function is no usable data is available. Prepares the dataset, adds bubbles to the canvas. Size and color of bubble is based on the number of incidents. Also removes old bubbles from canvas if necessary.

#### CSS

**style.css**

My own stylesheet for styling the index.html page. Contains BootStrap elements. Mainly used for positioning the visualizations via the BootStrap grid system.

**bootstrap.min.css**

Default BootStrap CSS file. Saved locally for speed.

**font.css**

Google Material Design font CSS file. Also saved locally for speed.

#### Python

**parse.py**

Python script used for parsing the original downloaded JSON dataset. Needed because the original format is not handy usable for in the stacked barchart. One of the most ugly pieces of code I have ever written.... But it works.

**bubble.py**

Mostly the same code as the other Python script, with minor modifications. Used for parsing the original JSON dataset to a usable format for the bubble chart.

#### Dataset
**vcdb.json**

The original dataset as it is available on the GitHub repository of  [VCDB](https://github.com/vz-risk/VCDB). Not edited in any way.


**bubble.json**

Dataset created with the bubble.py script from the original vcdb dataset. Used for drawing and updating the bubble chart.

**barchartdata.json**

JSON file created with the parse.py script. Also used for drawing and updating the stacked barchart.


#### Libs
I use some external libraries that I did not write myself. The used libraries are listed below:
* bootstrap.min.js
* d3.v3.min.js
* d3-collection.v1.min.js
* datamaps.world.min.js
* jquery-3.2.1.slim.min.js
* popper.min.js
* queue.v1.min.js
* topojson.min.js
* underscore-min.js

### In detail
#### main.js
#### initDashboard()
Acts as a wrapper for the actual functions in the file. The wrapper function is called when the page is successfully loaded by the browser. The following four functions are embedded in the wrapper:
* initMap()

  Adds a map to the webpage with datamaps of the world. Adds color to the countries containing data for the default year.
* initDonut()

  Defines size and properties for the SVG canvas and adds it to the webpage. No actual pieces of the donut chart are added here yet.

* initBarChart()

  Also defines the size and properties for the SVG canvas and layout for the stacked barchart. Adds the X and Y axis to the SVG for the default year.

* initBubble()

  The same as for the initDonut() and initBarChart() function, this function adds a SVG canvas to the webpage with appropriate dimensions. Appends the "circle" legend. The actual bubble are not yet added to the canvas.

Last but not least, the initDashboard() function is responsible for triggering the update function. There are several listeners implemented to detect if a user clicks on a country on the worldmap, changes the year with the slider or changing the radio button at the bubble chart.


The following files are all called from within the initDashboard() function. They do not interact with each other or share code. Each file is responsible for a standalone visualization.

#### worldmap.js
* updateMap()

  Updates the datamaps worldmap with the built-in updateChoropleth function. But before this function is called, a empty dataset needs to be assigned to the worldmap. Otherwise datamaps only updates the current values that are also present in the new dataset and does nothing with the rest.

#### donut.js
* drawDonut()
  Takes some settings from the main.js as input, such as the SVG canvas, and actually adds all the visual components to it. Function is capable to draw a complete new donut, as well as updating an existing one.

#### stackedbarchart.js
* drawStackedBarChart()
  Also takes some global settings from the main.js file. With these values it prepares the dataset for usage and creates an stacked barchart. If no data is available for some actor or motive, a zero value is inserted.

#### bubble.js
* drawBubble()
  This function also takes some properties set in the main.js file as a starting point. Within the prepared SVG canvas the bubble are created. The size of the bubbles is based on the value of the properties. Also capable to create the initial visualization as well as updating an existing bubble chart.

#### support.js
The support.js file contains a lot of supportive functions. A lot of the functions are written with the same goal, preparing data that can be used to create/update an visualization:
* countIncidentsCountry()
* dataBarchart()
* countIndustry()
* prepareDataMap()

Each visualization has mouse-over (hovering) effects. Because the code is called often, I wrote functions for it. All these have the same effect, show, move and remove the tooltip for all visualizations:
* mouseoverDonut()
* mousemoveDonut()
* mouseoutDonut()
* mouseoverBarChart()
* mousemoveBarChart()
* mouseoutBarChart()
* mouseoverBubble()
* mousemoveBubble()
* mouseoutBubble()

## Challenges
### Update pattern
When I first started writing my code, I separated my initial drawing of the visualizations and updating them in separate functions. As you will read in the "changes" section, I fixed this.  Because of the initial setup, I had a lot of duplicate code. This made the code super unclear and redundant. In the beginning I also struggled with the linking/updating. The bubble chart was quite easy, but the stacked barchart was a real challenge. Looking back I am quite satisfied at the current state of the code.

### Dataset
This was the most frustrating part of the project. The original dataset is offered in JSON format. I thought I could use it easily in this project, but I was so wrong. Finally I wrote two Python scripts to parse the original JSON into a usable form for the stacked barchart and bubble chart.

### Positioning/styling
I do not have that much experience with HTML and CSS, so positioning of the visualizations and the styling of the page was quite a struggle sometimes. I was able to use the grid system of BootStrap, that made my life a bit easier. Scaling the SVG automatically to the right size because of device resolution was hard and works, partially.

## Changes
1. Change a visualization type. In my first design document I had a heatmap that was changed to a stacked barchart. There were no trade-offs because another aspect of the dataset was shown. My storytelling would not change by this decision so I was ok with it.
2. Initially I had a a grid of two by two grid with the four visualizations. For clarity and user experience I made the worldmap cover the width of the screen. The other visualizations are next to each other underneath the map. When I made the change I could clearly see that it was better. The worldmap would otherwise be too small. With this solution all the visualizations have a right size.
3. Show only the top 5 industries in the donut chart. This was feedback given by my friday group. I agreed with it because sometimes 15+ industries were shown. By showing the top 5 I kept clarity and also show the biggest effected industries. The small slices that you almost could not see are not that interesting vs the top 5.
4. Not using the material design color palette for all visualizations. This was my initial idea. Changed it because the difference between the visualization parts were not big enough. The final combination of color palettes is much clearer for the end-user. Trade-off is that it does look less like one coherent dashboard.
5. Implemented a slider for the years instead of a dropdown menu. This works way more intuitive for the user. It is also a lot of fun to scroll with, to see the worldmap and visualizations change accordingly.
6. Added an Bootstrap Collapse button to my navbar. When this is clicked, some information about the visualization and the data-source is shown. This is for extra clarity for the end-users. Was not in my original DESIGN.md but I thought it was necessary to explain the data-source to the user.
7. Drastically changed the code flow. Merged my way too duplicate code into functions that draw the initial visualizations and can also update them. I should have done this way earlier in the project. Each visualization has now its own JavaScript file.
8. Swapped the position of the donut chart and stacked bar chart. This was done because some users gave feedback that they saw a relation between some visualizations that used similar color schemes. By changing the order of the visualizations the change of assuming a relation between visualizations is smaller.


## Ideal world
In an ideal world I would not choose for another solution for the final project. There is one thing I would have done differently though. In the middle of the project I spend significant time on Python scripts to parse the original JSON into a workable format. This was very frustrating, because I wanted to spend my time on programming visualizations. If I had known beforehand that my dataset was not completely in an easy to use format I would have parsed it before I started programming the rest. With a completely ready to use JSON file you can aim completely at the actual visualizations.

### Author
* Mark Pijnenburg
