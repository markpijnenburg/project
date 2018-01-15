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
