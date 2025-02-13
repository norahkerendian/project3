// Set up the SVG canvas
const width = 960, height = 600;
const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator
const projection = d3.geoMercator()
    .center([-74, 4])  // Center over Colombia
    .scale(2000)       // Adjust scale as needed
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load and render TopoJSON
d3.json("colombia-municipalities.json").then(topology => {
    const geojson = topojson.feature(topology, topology.objects.mpios);

    svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("class", "municipality")
        .attr("d", path)
        .on("mouseover", function (event, d) {
            d3.select(this).style("fill", "#005b96");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).style("fill", "#b3cde0");
        })
        .append("title")  // Tooltip with municipality name
        .text(d => d.properties.name);
});
