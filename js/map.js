class Themap {
    constructor() {
        this.map = null;
        this.infoWindow = null;
        this.markers = [];
    }


    createMap() {

        /*Génération de la Google map à partir de la doc de Google*/
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: 48.8737815,
                lng: 2.3501649
            },
            zoom: 10,
            mapId: '6f02331cadafb87d'
        });

        //Géolocalisation de l'utilisateur
        this.showUser();
    }


    showUser() {
        
        /*Géolocalisation
        this.infoWindow = new google.maps.InfoWindow();*/
        
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    /*this.infoWindow.setPosition(pos);
                    this.infoWindow.setContent("Vous êtes ici.");
                    this.infoWindow.open(this.map);*/
                    this.map.setCenter(pos);

                    const marker = new google.maps.Marker({
                        position: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        icon: "../img/picto-bonhomme.png",
                        map: this.map,
                    });

                },
                () => {
                    this.handleLocationError(true);
                }
            );
        } else {
            // Le navigateur ne permet pas la géolocalisation
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

        //Afficher tous les restaurants au départ
        this.showDatas(data);

        //Afficher les restaurants filtrés
        this.filter(data);
    }


    filter(data) {

        //Au clic sur le bouton du filtre
        document.getElementById('btnfiltre').addEventListener("click", (event) => {
            event.stopPropagation();

            let min = document.getElementById("min").value;
            let max = document.getElementById("max").value;

            //Pour chaque restaurant
            for (let i = 0; i < data.length; i++) {

                let average = this.reviewsAverage(data[i]);

                //Si la moyenne est comprise entre les deux nombres du filtre :
                if (average >= min && average <= max) {

                    this.markers[i].setVisible(true);

                    document.getElementById('restau' + i).style.display = 'block';

                } else {
                    this.markers[i].setVisible(false);
                    document.getElementById('restau' + i).style.display = 'none';
                }
            }
        });
    }


    showDatas(data) {

        for (let i = 0; i < data.length; i++) {

            //Créer le marqueur associé sur la Google map
            const marker = new google.maps.Marker({
                position: {
                    lat: data[i].lat,
                    lng: data[i].long
                },
                icon: "../img/picto-restau.png",
                map: this.map,
                restaurant: this.reviewsAverage(data[i])
            });
            this.markers.push(marker);


            //Afficher les informations du restaurant sur la section de gauche 
            let myRestaurant = document.createElement('article');
            myRestaurant.id = 'restau' + i;
            let myRestaurantName = document.createElement('h2');
            let myRestaurantAverage = document.createElement('div');

            myRestaurantAverage.className = 'average';
            let myRestaurantStar = document.createElement('img');
            myRestaurantStar.src = '../img/star.svg';
            let myRestaurantRating = document.createElement('button');
            myRestaurantRating.id = 'average' + i;
            myRestaurantRating.className = 'avis';
            let myRestaurantAddress = document.createElement('p');

            myRestaurantName.textContent = data[i].restaurantName;
            myRestaurantAverage.textContent = this.reviewsAverage(data[i]);
            myRestaurantRating.textContent = 'Voir les avis';
            myRestaurantAddress.textContent = data[i].address;

            myRestaurant.appendChild(myRestaurantName);
            myRestaurant.appendChild(myRestaurantAverage);
            myRestaurant.appendChild(myRestaurantAddress);
            myRestaurantAverage.appendChild(myRestaurantStar);
            myRestaurantAverage.appendChild(myRestaurantRating);

            document.getElementById('restaurants').appendChild(myRestaurant);

            //Au clic sur la moyenne du restaurant le détail des avis s'affiche 
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

        //Affichage de tous les avis
        document.getElementById('comments').style.opacity = 1;
        document.getElementById('comments').style.zIndex = 999999999;
        document.getElementById('comments').innerHTML = `
        <div class="row intro">
            <div class="col-4">
                <img src="https://maps.googleapis.com/maps/api/streetview?location=${data.lat},${data.long}&size=456x456&key=AIzaSyDNsKPjjoTgstzfl7-RWgmAx3_tEQKghUQ" alt="">
            </div>
            <div class="col-8">
                <h2> ${ data.restaurantName } </h2>
                <div class="average"> <p>Note : ${ this.reviewsAverage(data) }</p> <img src="../img/star.svg">  </div>
                <img class="close" src="../img/close.svg">
            </div>
        </div>
        `;

        for (let i = 0; i < data.ratings.length; i++) {
            document.getElementById('comments').innerHTML += `
            <div class="review ">
            <div class="number"> <p>${data.ratings[i].stars}</p> <img src="../img/star.svg">  </div>
            <p> ${data.ratings[i].comment} </p>
            </div>
            `;
        }

        //Au clic sur la croix on masque les avis
        $(".close").click(function () {
            document.getElementById('comments').style.opacity = 0;
            document.getElementById('comments').style.zIndex = -1;
        });
    }
}
