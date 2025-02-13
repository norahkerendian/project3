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


