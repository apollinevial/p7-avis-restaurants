let map, infoWindow;

function initMap() {

    const bronco = {
        lat: 48.8737815,
        lng: 2.3501649
    };
    const babalou = {
        lat: 48.8865035,
        lng: 2.3442197
    };

    let map = new google.maps.Map(document.getElementById("map"), {
        center: bronco,
        zoom: 10,
    });

    const marker1 = new google.maps.Marker({
        position: bronco,
        map: map,
    });

    const marker2 = new google.maps.Marker({
        position: babalou,
        map: map,
    });

    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.createElement("button");

    locationButton.textContent = "Pan to Current Location";

    locationButton.classList.add("custom-map-control-button");

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ?
        "Error: The Geolocation service failed." :
        "Error: Your browser doesn't support geolocation."
    );

    infoWindow.open(map);
}


/*Create restaurants*/
let bronco = new Restaurant("Bronco", "39 Rue des Petites Écuries, 75010 Paris");
bronco.location.latitude = 48.8737815;
bronco.location.longitude = 2.3501649;

let babalou = new Restaurant("Babalou", "4 Rue Lamarck, 75018 Paris");
babalou.location.latitude = 48.8865035;
babalou.location.longitude = 2.3442197;

/*Créer un tableau des pistolets*/
var tabRestaurants = [bronco, babalou];

let mymap = new Mymap();
