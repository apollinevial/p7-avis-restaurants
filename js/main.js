let map, infoWindow;

function initMap() {

    /*coordonnées restaurants*/
    const coordbronco = {
        lat: 48.8737815,
        lng: 2.3501649
    };

    const coordbabalou = {
        lat: 48.8865035,
        lng: 2.3442197
    };

    /*création map*/
    let map = new google.maps.Map(document.getElementById("map"), {
        center: coordbronco,
        zoom: 10,
    });

    /*création marqueurs restaurants*/
    const marker1 = new google.maps.Marker({
        position: coordbronco,
        map: map,
    });

    const marker2 = new google.maps.Marker({
        position: coordbabalou,
        map: map,
    });

    /*geolocalisation*/
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


/*XML*/
/*var get = function (url) {
    return new Promise(function (resolve, reject) {
        var xhr = new window.XMLHttpRequest()

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(xhr)
                }
            }
        }
        xhr.open('GET', url, true)
        xhr.send()
    })
}


var getPosts = async function () {
    try {
        var response = await get('../restaurants.json')
        var restaurants = JSON.parse(response)
    } catch(e) {
        console.log('Il y a eu un problème', e)
    }

    return (restaurants)
}


getPosts().then(function (restaurants) {
    console.log(restaurants[1])
    
}).catch(function (error) {
    console.log(error)
    
}).then(function () {
    console.log('Fin des requêtes AJAX')
    
})*/



/*FETCH 1*/
/*
async function loadRestaurants() {
    return (await fetch("../restaurants.json")).json();
}

document.addEventListener("DOMContentLoaded", async () => {
    let restaurants = [];
    
    try {
        restaurants = await loadRestaurants();
    } catch (e) {
        console.log("Erreur !");
        console.log(e);
    }
    console.log(restaurants);
});*/


/*FETCH 2*/
fetch('../restaurants.json').then(res => {

        if (res.ok) {
            res.json().then(data => {
                
                console.log(data)

                    for (var i = 0; i < data.length; i++) {
                        
                        var myRestaurant = document.createElement('article');
                        var myRestaurantName = document.createElement('h2');
                        var myRestaurantAddress = document.createElement('p');
                        var myRestaurantLat = document.createElement('p');
                        var myRestaurantLong = document.createElement('p');

                        myRestaurantName.textContent = data[i].restaurantName;
                        myRestaurantAddress.textContent = 'Address: ' + data[i].address;
                        myRestaurantLat.textContent = 'Lat: ' + data[i].lat;
                        myRestaurantLong.textContent = 'Long:' + data[i].long;

                        myRestaurant.appendChild(myRestaurantName);
                        myRestaurant.appendChild(myRestaurantAddress);
                        myRestaurant.appendChild(myRestaurantLat);
                        myRestaurant.appendChild(myRestaurantLong);

                        document.getElementById('restaurants').appendChild(myRestaurant);
                }
            })
            
        } else {
            console.log("Erreur");
        }
    })