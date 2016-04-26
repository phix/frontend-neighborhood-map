
var mapDiv = document.getElementById("mapDiv");
var RESET_LOCATION = {lat:38.543099, lng:-90.286107};
var markersArray = [];
var fourSquareConfig = {
	client_id: '5YPQY5E5OZWLH0IHGK5QOJN42WCS2ZXFLTGKV5Y410RGCSJR',
	client_secret: '5O4COWYXKDD5RF5QEZKVKEEWQ4N2XHEAT124GZZI3YD5PFBD',
	apiUrl: 'https://api.foursquare.com/',
	version: '20160131'
};
var infoWindowTemplate = "<div id=venueid>Name = venuename<br>Address = venueaddress<br></div>";

var locs = [
           {name : "Jefferson Barracks County Park", coords:{lat:38.512242, lng: -90.279623}, note: "Favorite Park", venue: "4acbc3fbf964a5201dc620e3", marker: 0},
           {name : "Sylvan Springs County Park", coords:{lat:38.504306, lng: -90.291442}, note:  "Close to Home", venue: "4c0420d99a7920a118dad079", marker: 1},
           {name : "Willmore Park", coords:{lat:38.570624, lng: -90.301373}, note:  "Not The Best", venue: "4b4fe171f964a5207b1827e3", marker: 2},
           {name : "Lemay County Park", coords:{lat:38.541881, lng: -90.272617}, note:  "Great Slides", venue: "4c279474136d20a11432e761", marker: 3},
           {name : "Alaska Park", coords:{lat:38.552015, lng: -90.265318}, note:  "Floods Often", venue: "4f66a608e4b0ce431f2a2b9b", marker: 4}
      ];

function initialize() {
	var mapOptions = {
	  zoom: 12,
	  center: RESET_LOCATION,
	  mapTypeId: google.maps.MapTypeId.HYBRID
	};
    map = new google.maps.Map(mapDiv, mapOptions);  
    ko.applyBindings(new viewModel());
}


var viewModel = function(){
  var self = this;
  self.locs = ko.observableArray([]);
  self.query = ko.observable('');
  self.googlemap = map;
	
  self.activateMarker = function(loc) {
  	  $('#listModal').modal('toggle');
	  google.maps.event.trigger(markersArray[loc.marker], 'click');
  };

   // load initial list of locs
  for (var loc in locs) {    
	  self.locs.push(locs[loc]);
	  addMarker(loc);

  }

	function addMarker(loc) {
	    var marker = new google.maps.Marker({
	      position: locs[loc].coords, 
	      map: map,
	      label: locs[loc].name
	    });

		markersArray.push(marker);
        google.maps.event.addListener( marker, 'click', function() {
        	var currentMarker = this;        	
        	if(marker.info){
        		marker.info.close();
        	}
        	marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function(){ marker.setAnimation(null); }, 750);

			$.ajax({ 
		    type: 'GET', 
		    url: fourSquareConfig.apiUrl + 'v2/venues/' + locs[loc].venue + '?client_id=' + fourSquareConfig.client_id + '&client_secret='+ fourSquareConfig.client_secret  + '&v=' + fourSquareConfig.version, 
		    dataType: 'json',
		    success: function (data) { 
		    	 var infoWindow = new google.maps.InfoWindow({   });
		       	 var myVenue = data.response.venue;
		    		tempOutput = infoWindowTemplate;
		    		infoWindow.setContent(tempOutput.replace("venueid", myVenue.id).replace("venuename", myVenue.name).replace("venueaddress", myVenue.location.formattedAddress));
		    		infoWindow.open(map,currentMarker);
		        },
	        error: function(errMsg){
	        	var infoWindow = new google.maps.InfoWindow({   });
	        	infoWindow.setContent("A critical error has occured");
	        	infoWindow.open(map,currentMarker); 
	        	}
		    });			
			          
        });
	}

	function removeMarker() {
	    if (markersArray) {
	        for (i=0; i < markersArray.length; i++) {
	            markersArray[i].setMap(null);
	        }
	    markersArray.length = 0;
	    }
	}

  self.search = function(value) {
  	removeMarker();
    self.locs.removeAll();
    for (var loc in locs) {
      if (locs[loc].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locs.push(locs[loc]);
        addMarker(loc);
      }
    }
  };

  self.query.subscribe(self.search);
 };

    function gmapsError(){
    	document.getElementById("mapDiv").innerHTML  = "Cannot connect to Google Maps, please try again later";
    	alert("Cannot connect to Google Maps, please try again later");
    }


