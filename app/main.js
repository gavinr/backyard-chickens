$(document).ready(function () {

  var searchControl = L.esri.Geocoding.geosearch();
  console.log('searchControl', searchControl);
  // listen for the results event and add every result to the map
  searchControl.on("results", function(data) {
    console.log('data', data);
    // results.clearLayers();
    // for (var i = data.results.length - 1; i >= 0; i--) {
    //     results.addLayer(L.marker(data.results[i].latlng));
    // }
  });

  //Set up button click handler for the search form:
  $("button").click(function () {
    var input = document.getElementById('address').value;
    arcgisRest.geocode(input).then(function(data) {
      console.log('data', data);
      showRegs(L.latLng(data.candidates[0].location.y, data.candidates[0].location.x));
    });
  });

  //Set up map:
  var mymap = L.map('mapid').setView([38.66085, -90.362549], 11);
  L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(mymap);

  //Initialize popup object to show information on the map:
  var popup = L.popup();

  function parseResult(city, county, state, popup, map, coords) {
    console.log('parseResult', city, county, state);
    //Parse result:
    var place = city;
    if (city == undefined) place = "unincorporated " + county;
    var popup_content = place + ":<br />";
    // Look up the regulations string for resulting location using JS Objects (hashtables):
    if (state == "Missouri") {
      if (city == undefined) {
        if (missouri_counties[county] != undefined) {
          popup_content += missouri_counties[county];
        } else {
          popup_content += "Unknown :(";
        }
      } else {
        if (missouri_cities[city] != undefined) {
          popup_content += missouri_cities[city];
        } else {
          popup_content += "Unknown :(";
        }
        // if (city == "Saint Louis") {
        //   coop_form = document.getElementById("coopForm").innerHTML;
        //   popup_content += "<form id=\"coopSTL\">" + coop_form +
        //     "<div id=\"chickens-response\"></div></form>";
        // }
      }
    } else {
      // Check Illinois too:
      if (city == undefined) {
        if (illinois_counties[county] != undefined) {
          popup_content += illinois_counties[county];
        } else {
          popup_content += "Unknown :(";
        }
      } else {
        if (illinois_cities[city] != undefined) {
          popup_content += illinois_cities[city];
        } else {
          popup_content += "Unknown :(";
        }
      }
    }
    // Show source only if regulations shown
    if ((missouri_counties[county] != undefined) || (missouri_cities[city] !=
      undefined) || (illinois_counties[county] != undefined) || (illinois_cities[
        city] != undefined)) {
      popup_content += '<br /><br />Source:<br /><a href="' + source_url + '">' + source_url +
        '</a>';
    }
    //Display result on the map:
    popup.setContent(popup_content);
    popup.setLatLng(coords);
    popup.openOn(map);
  }


  //Show chicken regulations at coordinates:
  function showRegs(coords) {
    arcgisRest.reverseGeocode([coords.lng, coords.lat], {
      'featureTypes': 'PointAddress'
    }).then(function (response) {
      console.log('response', response);
      parseResult(response.address.City, response.address.Subregion, response.address.Region, popup, mymap, coords);
    }.bind(this));
  }

  // Set up handler function for click events:
  mymap.on('click', function(e) {
    showRegs(e.latlng)
  });
});

