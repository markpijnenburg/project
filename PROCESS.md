# Process Book  | Minor Programmeren | UvA
## Author
* Mark Pijnenburg | 11841117

## Week 1
### Monday
Wrote the proposal document. I already had an idea made during the Christmas holidays, but not on paper. After writing the proposal document, I created a repo on GitHub following the default structure.

### Tuesday
Started writing a design document. Because I had a quite extensive project proposal with a design I could re-use some things. The other things were quite easy to write. I changed a visualization that I had in mind. First I would make a heatmap, but replaced it for a bubble chart. I was finished quite early with this document so I started making directories and files in my local repository.

### Wednesday
Had my design document checked by Tim. This was ok. I started creating a HTML template with an  Bootstrap grid, so my visualizations were divided equally. After making the Bootstrap layout I made a start with the world map, using the datamaps library. I also changed some of my dataset. Datamaps uses three letter country codes, my dataset used two letter codes. After changing this in the dataset, I also changed the industry / asset codes to their full text. By doing this, I could use one overarching dataset for the project.

### Thursday
Changed my HTML layout. Instead of two visualizations next to each other I chose to make my map bigger, and the other visualizations underneath it and next to each other. Changed my HTML/CSS so that the world map scales right.

### Friday
Mapped/nested the data for the donut chart. Tested if I could filter it on year, which I could. After preparing the data I made a start with the donut chart and the legend. Basic visualization is present.

## Week 2
### Monday
Fixed the position of my donut chart in the HTML page. Changed my idea for the donut chart. I only show the top 5 industries instead of all the industries. This was too much information to show in the donut chart. Also fixed the legend and tool-tip. When hovering a slice of the donut, the specific industry name is shown, including the corresponding number of incidents.

### Tuesday

Partly implemented the linking of the donut chart when changing the year/clicking a country on the map. Donut is updated but not the legend. Decided for updating to use a global variable storing the necessary parts of the visualizations. Made an start implementing an updatable legend.

### Wednesday
Made the legend from the donut chart updatable. When changing the year from the drop down menu, or when clicking a country, the donut chart including the legend is updated accordingly. Tried to make a start with the next visualization, a stacked bar chart. I then found out that my dataset nesting was not easy to use for this purpose. End of the day I was busy in Python trying to fix a usable JSON file.

### Thursday
Continued all day with Python to parse my original JSON file. This was not easy. At a given moment I skipped parsing the dataset for the stacked bar chart and went on with the dataset for the last visualization, a bubble chart. This dataset was created more easily because there is not that much of nesting/complexity present. End of the day my bubble chart JSON was ready and my stacked bar chart almost.

### Friday
Finally fixed the dataset for the stacked bar chart. Implemented a very basic (static) stacked bar chart with the parsed dataset. The visualization is far from done, but now I at least now the dataset is correct. Next week I am going to finish the stacked bar chart and make it interactive / link it with the other parts of the dashboard. Also had presentations in the afternoon.

## Week 3
### Monday
Decided not to use my Material Design color palette function for my stacked bar chart. It became very unclear where the line was between the different rectangles. I now use a default color palette from D3 to color the stacked bar chart.
