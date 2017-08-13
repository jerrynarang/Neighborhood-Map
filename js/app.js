var map, clientID, clientSecret;

function ViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;

            // Foursquare API Client
            clientID = "WWLGBKTS3O5OFPVA10C5IK031LF133CXDH3J3P1DHRCISWPY";
            clientSecret =
                "KRST4VF3GCI5NR2CBO0VZV4UZREEEITCLKVCP0YFI1WJNWGV";

            // URL for Foursquare API
            var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170708' + '&m=foursquare';
            // Foursquare API
            $.getJSON(apiUrl).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.zip = response.location.formattedAddress[3];
                self.category = response.categories[0].shortName;

                self.htmlContentFoursquare =
                    '<h5 class="iw_subtitle">*' + self.category +
                    '*</h5>' + '<div>' +
                    '<h6 class="iw_address_title"> Address: </h6>' +
                    '<p class="iw_address">' + self.street + '</p>' +
                    '<p class="iw_address">' + self.city + '</p>' +
                    '<p class="iw_address">' + self.zip + '</p>'+ '</div>' + '</div>';

                infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function() {
                // Send alert
                alert(
                    "Error loading the Foursquare API. Please refresh your page to try again."
                );
            });

            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.title +
                '</h4>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    this.bounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 2500);
    };

    this.initMap = function() {
        // Create a styles array to use with the map.
        // Map features and stylers are combined into the styles array 
        var styles = [
          {
            featureType: 'water',  // Map features are geographic elements like roads,parks,water bodies etc!
            stylers: [
              { color: '#19a0fu' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',  // What you want to change about your feature type is element or elementType!
            stylers: [                          // stylers are visibilty properties that can be applied to map
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',  // elementType can be changes in geometry , label etc
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];


        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(28.613939, 77.209021),
            zoom: 12,
            styles: styles,
            mapTypeControl: false 
          // mapTypeControl allows the user to change the map type to road,terrain,sattelite etc
          // here we are disabling mapTypeControl by setting it to false !

        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].title;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.bounceMarker);
        }
    };

    this.initMap();

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work
    this.myLocationsFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'Google Maps did not load. Please refresh the page and try again!'
    );
};

function startApp() {
    ko.applyBindings(new ViewModel());
}