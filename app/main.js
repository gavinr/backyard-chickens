$(document).ready(function() {

  //Set up button click handler for the search form:
  $("button").click(function () {
    // Get the person's entered address
    var input = document.getElementById('address').value;
    // Convert the address into the right format for the OpenStreetMaps search
    var spacesReplaced = input.replace(" ", "%20");
    // Send the user's address to OpenStreetMaps and get the returned city
    var searchURL = "https://nominatim.openstreetmap.org/search/" + input + "?format=json&addressdetails=1&limit=1&polygon_svg=1";
    //console.log(searchURL);
    $.post(searchURL,
        function (data) {
            console.log(data);
            var city = data[0].address.city;
            //console.log(city);
            //document.getElementById("result").innerHTML = " is in "+city;
            //Update info bubble on map:
            showRegs(L.latLng(data[0].lat, data[0].lon));
            //^^this only works because it can only get run after the body script tag initializes showCity
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
  //Show chicken regulations at coordinates:
  function showRegs(coords) {
      //Send the coordinates to OpenStreetMaps and get the returned city:
      var queryURL = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + coords.lat + "&lon=" +
          coords.lng + "&zoom=18&addressdetails=1";
      var xHR = new XMLHttpRequest();
      xHR.addEventListener("load", function () {
          //Parse result:
          //console.log(xHR.responseText);
          var address = JSON.parse(xHR.responseText).address;
          var place = address.city;
          if (address.city == undefined) place = "unincorporated " + address.county;
          var popup_content = place + ":<br />";
          // Look up the regulations string for resulting location using JS Objects (hashtables):
          if (address.state == "Missouri") {
              if (address.city == undefined) {
                  if (missouri_counties[address.county] != undefined) {
                      popup_content += missouri_counties[address.county];
                  } else {
                      popup_content += "Unknown :(";
                  }
              } else {
                  if (missouri_cities[address.city] != undefined) {
                      popup_content += missouri_cities[address.city];
                  } else {
                      popup_content += "Unknown :(";
                  }
                  if (address.city == "St. Louis") {
                      coop_form = document.getElementById("coopForm").innerHTML;
                      popup_content += "<form id=\"coopSTL\">" + coop_form +
                          "<div id=\"chickens-response\"></div></form>";
                  }
              }
          } else {
              // Check Illinois too:
              if (address.city == undefined) {
                  if (illinois_counties[address.county] != undefined) {
                      popup_content += illinois_counties[address.county];
                  } else {
                      popup_content += "Unknown :(";
                  }
              } else {
                  if (illinois_cities[address.city] != undefined) {
                      popup_content += illinois_cities[address.city];
                  } else {
                      popup_content += "Unknown :(";
                  }
              }
          }
          // Show source only if regulations shown
          if ((missouri_counties[address.county] != undefined) || (missouri_cities[address.city] !=
                  undefined) || (illinois_counties[address.county] != undefined) || (illinois_cities[
                  address.city] != undefined)) {
              popup_content += '<br /><br />Source:<br /><a href="' + source_url + '">' + source_url +
                  '</a>';
          }
          //Display result on the map:
          popup.setContent(popup_content);
          popup.setLatLng(coords);
          popup.openOn(mymap);
          //console.log(address.city);
      });
      xHR.open("GET", queryURL);
      xHR.send();
      //^^(I don't usually like using extra libraries like jQuery, so I used plain Javascript.)
  }
  //Set up handler function for click events:
  function onMapClick(e) {
      /*
      //Example code:
      popup
          .setLatLng(e.latlng)
          .setContent("You clicked the map at " + e.latlng.toString())
          .openOn(mymap);
      */
      //Get containing city and display it on the map:
      showRegs(e.latlng);
  }
  mymap.on('click', onMapClick);
});

