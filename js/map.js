class Themap {
    constructor() {
        this.map = null;
        this.infoWindow = null;

    }


    createMap() {

        /*création map*/
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: 48.8737815,
                lng: 2.3501649
            },
            zoom: 10,
        });

        this.showUser();

    }


    showUser() {
        this.infoWindow = new google.maps.InfoWindow();
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    this.infoWindow.setPosition(pos);
                    this.infoWindow.setContent("Vous êtes ici.");
                    this.infoWindow.open(this.map);
                    this.map.setCenter(pos);
                },
                () => {
                    this.handleLocationError(true);
                }
            );
        } else {
            // Browser doesn't support Geolocation
            this.handleLocationError(false);
        }
    }


    handleLocationError(browserHasGeolocation) {
        this.infoWindow.setPosition(this.map.getCenter());
        this.infoWindow.setContent(
            browserHasGeolocation ?
            "Erreur: le service de géolocalisation ne fonctionne pas." :
            "Erreur: Votre navigation bloque la géolocalisation."
        );

        this.infoWindow.open(this.map);
    }


    showRestaurant(data) {

        for (let i = 0; i < data.length; i++) {

            let myRestaurant = document.createElement('article');
            let myRestaurantName = document.createElement('h2');
            let myRestaurantAverage = document.createElement('button');
            myRestaurantAverage.id = 'average' + i;
            let myRestaurantAddress = document.createElement('p');

            myRestaurantName.textContent = data[i].restaurantName;
            myRestaurantAverage.textContent = this.reviewsAverage(data[i]);
            myRestaurantAddress.textContent = data[i].address;

            myRestaurant.appendChild(myRestaurantName);
            myRestaurant.appendChild(myRestaurantAverage);
            myRestaurant.appendChild(myRestaurantAddress);

            document.getElementById('restaurants').appendChild(myRestaurant);

            new google.maps.Marker({
                position: {
                    lat: data[i].lat,
                    lng: data[i].long
                },
                map: this.map,
            });


            document.getElementById('average' + i).addEventListener("click", (event) => {

                event.stopPropagation();
                this.showReviews(data[i])
            });
        }
    }

    reviewsAverage(data) {
        //création d'un tableau qui rassemble toutes les notes
        let sum = 0;
        for (let i = 0; i < data.ratings.length; i++) {
            sum += Number(data.ratings[i].stars);
        }
        return sum / data.ratings.length;
    }

    showReviews(data) {
        console.log('click');

        document.getElementById('comments').style.opacity = 1;
        document.getElementById('comments').innerHTML = `
        <h2> ${ data.restaurantName } </h2>
        <p id="average"> ${ this.reviewsAverage(data) } </p>
        <p> ${data.address } </p>
        <img class="close" src="../img/close.svg">
        `;
        
        for (let i = 0; i < data.ratings.length; i++) {
            
        document.getElementById('comments').innerHTML += `
        <div class="review ">
        <p> ${data.ratings[i].stars} </p>
        <p> ${data.ratings[i].comment} </p>
        </div>
        `;}

        $(".close").click(function () {
            document.getElementById('comments').style.opacity = 0;
        });
    }


}
