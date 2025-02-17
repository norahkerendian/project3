var map = L.map('map', {
    center: [4.6097, -74.0817], 
    zoom: 6,
    minZoom: 6,
    maxBounds: [[-6, -82], [15, -66]], 
    maxBoundsViscosity: 1.0, 
    attributionControl: false,
    zoomControl: false
});

map.createPane('background');
map.getPane('background').style.background = "black";

// 🔹 Create a new pane for circles with a HIGHER zIndex
map.createPane('circlesPane');
map.getPane('circlesPane').style.zIndex = 650;  // Higher than default (default overlay is ~400-600)
map.getPane('circlesPane').style.background = "red";

var infoBox = document.getElementById('info-box');
var infoBox1 = document.getElementById('info-box1');

fetch('municipalities.json')
    .then(response => response.json())
    .then(data => {
        var geoJsonLayer = L.geoJSON(data, {
            style: function(feature) {
                var ascii = feature.properties.ascii;
                var color = ascii > 91 ? 'red' : 'blue';
                return { fillColor: color, color: 'white', weight: 1 };
            },
            onEachFeature: function(feature, layer) {
                layer.on('mouseover', function(e) {
                    infoBox.textContent = feature.properties.NOMBRE_MPI; 
                    layer.setStyle({ color: 'red', fillColor: 'red' }); 
                });

                layer.on('mouseout', function(e) {
                    geoJsonLayer.resetStyle(layer); 
                });
            }
        }).addTo(map);
    });

map.on('mousemove', function(e) {
    infoBox1.innerHTML = e.latlng.lat.toFixed(6) + ', ' + e.latlng.lng.toFixed(6); 
});

let circles = [];
let minPopulation = 0, maxPopulation = 1000000;
let minCases = 0, maxCases = 5000;

// Get slider elements
const populationSlider = document.getElementById("populationSlider");
const casesSlider = document.getElementById("casesSlider");
const populationValue = document.getElementById("populationValue");
const casesValue = document.getElementById("casesValue");

// Listen for slider changes
document.getElementById("populationSlider").addEventListener("input", function () {
    minPopulation = parseInt(this.value);
    document.getElementById("populationValue").textContent = minPopulation;
    updateFilters();
});

document.getElementById("casesSlider").addEventListener("input", function () {
    minCases = parseInt(this.value);
    document.getElementById("casesValue").textContent = minCases;
    updateFilters();
});

populationSlider.min = minPopulation;
populationSlider.max = maxPopulation;
populationSlider.value = minPopulation;
populationValue.textContent = minPopulation.toLocaleString();

casesSlider.min = minCases;
casesSlider.max = maxCases;
casesSlider.value = minCases;
casesValue.textContent = minCases.toLocaleString();

fetch('cases.json')
    .then(response => response.json())
    .then(caseData => {

        // // Now plot the data
        caseData.forEach(entry => {
            let lat = entry.lat;
            let lng = entry.lng;
            let municipality = entry.Municipality;

            // 🔹 Calculate Average Cases & Population (2007-2019)
            let total_cases = 0;
            let total_population = 0;
            let years = 13;  // 2007 to 2019 = 13 years

            for (let year = 2007; year <= 2019; year++) {
                total_cases += entry[`Cases${year}`] ? parseFloat(entry[`Cases${year}`]) : 0;
                total_population += entry[`Population${year}`] ? parseFloat(entry[`Population${year}`]) : 0;
            }

            let average_cases = total_cases / years;
            let average_population = total_population / years;

            // 🔹 Prevent division by zero
            let case_per_population = average_population > 0 ? (average_cases / average_population) : 0;

            console.log(case_per_population);

            let color;
            if (case_per_population <= 0.0035) {
                color = "lightgreen"; // 🟢 Low
            } else if (case_per_population <= 0.007) {
                color = "yellow"; // 🟡 Medium-Low
            } else if (case_per_population <= 0.0105) {
                color = "orange"; // 🟠 Medium
            } else if (case_per_population <= 0.014) {
                color = "red"; // 🔴 High
            } else {
                color = "darkred"; // 🏴 Very High
            }

            // 🔹 Scale the circle size (Adjust scale factor as needed)
            let radius = case_per_population * 3000000; // Scale to make it visible

            // 🔹 Create a Circle for Each Municipality
            var circle = L.circle([lat, lng], {
                pane: 'circlesPane',
                color: color,  
                fillColor: color,  
                fillOpacity: 0.75,  
                radius: radius,
                customData: { population: average_population, cases: average_cases }
            });

            // Add Popup with Municipality Info
            circle.bindPopup(`
                <strong>${municipality}</strong><br>
                Average Cases: ${average_cases.toFixed(2)}<br>
                Average Population: ${average_population.toFixed(2)}<br>
                Cases per Capita: ${(case_per_population * 100).toFixed(2)}%
            `);

            circles.push(circle);
            circle.addTo(map);
        });

        updateFilters();
    })
    .catch(error => console.error("Error loading case data:", error));

// Update filters when sliders change
populationSlider.addEventListener("input", function () {
    minPopulation = parseInt(this.value);
    populationValue.textContent = minPopulation.toLocaleString();
    updateFilters();
});

casesSlider.addEventListener("input", function () {
    minCases = parseInt(this.value);
    casesValue.textContent = minCases.toLocaleString();
    updateFilters();
});

// Function to filter map circles
function updateFilters() {
    circles.forEach(circle => {
        let { population, cases } = circle.options.customData;
        if (population >= minPopulation && cases >= minCases) {
            circle.addTo(map);
        } else {
            map.removeLayer(circle);
        }
    });
}