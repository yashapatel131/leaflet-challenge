// earthquake geojson
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";
// API link to fetch geojson data of earthquakes
var APIlink_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


//define a function to scale the magnitdue
function markerSize(magnitude) {
    return magnitude * 3;
};

// Get request to the query URL
d3.json(queryUrl, function(data) {
   console.log(data);
   createEarthquakes(data.features);
   
    // Setting the number of 'ticks' or frames that will be displayed on the map
    steps: 2000
  });

// Get request to the plates URL
d3.json(APIlink_plates, function(data) {
    // Send the data features object to the createEarthquakes function
   console.log(data);
   createPlates(data);
});


  // function on magnitude color
  function adjustColor(magnitude){
    let GreenScaler = 300 - Math.round(magnitude * 40)
    return magnitude < 1 ? 'rgb(0,104,55)' :
    magnitude < 2  ? 'rgb(26,152,80)' :
    magnitude < 3  ? 'rgb(102,189,99)' :
    magnitude < 4  ? 'rgb(166,217,106)' :
    magnitude < 5  ? 'rgb(217,239,139)' :
    magnitude < 6  ? 'rgb(254,224,139)' :
    magnitude < 7  ? 'rgb(253,174,97)' :
    magnitude < 8  ? 'rgb(244,109,67)' :
    magnitude < 9  ? 'rgb(215,48,39)' :
                        'rgb(26,152,80)';
  }


  function createEarthquakes(earthquakeData){  
  // Give each feature a popup describing the place and time of the earthquake
  function onEachQuake(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
    "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
}
    
        
  // Run the onEachQuake function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachQuake: onEachQuake,
    pointToLayer: function (feature, latlng) {
      var color;
      var r = 255;
      var g = Math.floor(255-80*feature.properties.mag);
      var b = Math.floor(255-80*feature.properties.mag);
      color= "rgb("+r+" ,"+g+","+ b+")"
      
      var geojsonMarkerOptions = {
        radius: 4*feature.properties.mag,
        fillColor: adjustColor(feature.properties.mag),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }

  });



createMap(earthquakes);

};


// create faultlines layer group 

let tectonicplates = new L.LayerGroup();

function createPlates(PlateData){
    function onEachPlate(feature, layer){
        layer.bindPopup("<h3> Plate A: " + feature.properties.PlateA + "Plate B: " + feature.properties.PlateB +  "</h3>");
          };
    L.geoJSON(PlateData,{
        color: "#F26157",
        weight: 1.5
        }).addTo(tectonicplates);

        // adding layer to map
      tectonicplates.addTo(map)
    };


    var API_KEY = "YOUR KEY HERE"; 

function createMap(earthquakes){
    console.log('creating map...');

    let accessToken = "access_token={API_KEY}";

    let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    }),
    
     darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    }),
    
     highContrastMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    }),
    
     SatelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      accessToken: API_KEY
    });



    let baseMaps = {
        "Street Map": streetmap,
        "Dark map": darkMap,
        "Satellite map": SatelliteMap,
        "High Contrast map": highContrastMap
    };

    
    let overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": tectonicplates 
        
    };

    // Create a map object
    let myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });


  // Created layer control, baseMaps and overlayMaps and layer control to map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    
    // create legend for the color scale
    let legend = L.control({position:"bottomright"});

    legend.onAdd = function(map) {

        let div = L.DomUtil.create('div'),
            
            grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
            labels = [];

        div.innerHTML += "<h5 style='margin:2px background-color: bisque;'>Magnitude</h5>"
        
        for (let i = 0; i < grades.length; i++){
            div.innerHTML += '<i style="width:10px; height:10px; margin-right:5px; background-color:'+ adjustColor(grades[i]) + '">___</i>' + 
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>': '+');
        }
    
        return div;

    };
    legend.addTo(myMap);


};