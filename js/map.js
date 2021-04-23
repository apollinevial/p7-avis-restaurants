class Themap {
    constructor() {
        this.map = null;
        this.infoWindow = null;
        this.markers = [];
        this.data = null;
    }


    /*Method Création de la  carte*/
    createMap() {

        //Génération de la Google map à partir de la doc de Google
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: 48.8737815,
                lng: 2.3501649
            },
            zoom: 10,
            mapId: '6f02331cadafb87d'
        });

        //Géolocalisation et affichage de l'utilisateur
        this.showUser();

        //Au click sur un lieu ajout d'un marker
        this.map.addListener("click", (e) => {
            this.addNewRestaurant(e.latLng, this.map);
        });
    }


    //Method Ajout d'un nouveau marker au clic
    addNewRestaurant(latLng, map) {
        new google.maps.Marker({
            position: latLng,
            map: this.map,
            icon: "../img/picto-restau.png",
        });
        this.map.panTo(latLng);
    }


    //Method Géolocalisation et affichage de l'utilisateur sur la carte
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

                    /*Au clic sur le marker texte Vous êtes ici*/
                    var infoWindow = new google.maps.InfoWindow({
                        content: "Vous êtes ici"
                    });
                    google.maps.event.addListener(marker, 'click', function () {
                        infoWindow.open(map, marker);
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

        this.data = data;

        //Afficher tous les restaurants au départ
        this.showDatas();

        //Afficher les restaurants filtrés
        this.filter();
    }

    //Method moyenne notes d'un restaurant
    reviewsAverage(restau) {
        //création d'un tableau qui rassemble toutes les notes
        let sum = 0;
        for (let i = 0; i < restau.ratings.length; i++) {
            sum += Number(restau.ratings[i].stars);
        }
        return sum / restau.ratings.length;
    }


    //Method affichage restaurants
    showDatas() {

        for (let i = 0; i < this.data.length; i++) {

            //Créer le marker associé sur la Google map
            const marker = new google.maps.Marker({
                position: {
                    lat: this.data[i].lat,
                    lng: this.data[i].long
                },
                icon: "../img/picto-restau.png",
                map: this.map,
                restaurant: this.reviewsAverage(this.data[i])
            });
            this.markers.push(marker);


            //Afficher les informations du restaurant sur la section de gauche 
            let myRestaurant = document.createElement('article');
            myRestaurant.id = 'restau' + i;
            let myRestaurantName = document.createElement('h2');
            let myRestaurantReview = document.createElement('div');
            let myRestaurantAverage = document.createElement('p');
            myRestaurantAverage.className = 'restau-average';
            myRestaurantAverage.id = 'restau-average' + i;

            myRestaurantReview.className = 'restau-review';
            myRestaurantReview.id = 'restau-review' + i;
            
            let starImage = document.createElement('img');
            starImage.src = '../img/star.svg';
            
            let showRestaurantReview = document.createElement('button');
            showRestaurantReview.id = 'show-restau-review' + i;
            showRestaurantReview.className = 'avis';

            let addRestaurantReview = document.createElement('button');
            addRestaurantReview.id = 'add-restau-review' + i;
            addRestaurantReview.className = 'avis';

            let myRestaurantAddress = document.createElement('p');

            myRestaurantName.textContent = this.data[i].restaurantName;
            myRestaurantAverage.textContent = this.reviewsAverage(this.data[i]);
            showRestaurantReview.textContent = 'Voir les avis';
            addRestaurantReview.textContent = 'Ajouter un avis';
            myRestaurantAddress.textContent = this.data[i].address;

            myRestaurant.appendChild(myRestaurantName);
            myRestaurant.appendChild(myRestaurantReview);
            myRestaurant.appendChild(myRestaurantAddress);
            myRestaurantReview.appendChild(myRestaurantAverage);
            myRestaurantReview.appendChild(starImage);
            myRestaurantReview.appendChild(showRestaurantReview);
            myRestaurantReview.appendChild(addRestaurantReview);

            document.getElementById('restaurants').appendChild(myRestaurant);

            //Au clic sur le bouton "Voir les avis" le détail des avis s'affiche 
            document.getElementById('show-restau-review' + i).addEventListener("click", (event) => {
                console.log("clic avant ");
                event.stopPropagation();
                this.showReview(this.data[i]);
                console.log("clic");
            });

            //Au clic sur le bouton "Ajouter un avis" la popup s'affiche 
            document.getElementById('add-restau-review' + i).addEventListener("click", (event) => {
                event.stopPropagation();
                this.addReview(i)
            });
        }
    }

    //Method filtrer les restaurants par note
    filter() {

        //Au clic sur le bouton du filtre
        document.getElementById('btnfiltre').addEventListener("click", (event) => {
            event.stopPropagation();

            let min = document.getElementById("min").value;
            let max = document.getElementById("max").value;

            //Pour chaque restaurant
            for (let i = 0; i < this.data.length; i++) {

                let average = this.reviewsAverage(this.data[i]);

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


    //Method popup avis d'un restaurant
    showReview(restau) {

        //Affichage de tous les avis
        document.getElementById('popup-reviews').style.opacity = 1;
        document.getElementById('popup-reviews').style.zIndex = 99;
        document.getElementById('popup-reviews').innerHTML = `
        <div class="row intro">
            <div class="col-4">
                <img src="https://maps.googleapis.com/maps/api/streetview?location=${restau.lat},${restau.long}&size=456x456&key=AIzaSyDNsKPjjoTgstzfl7-RWgmAx3_tEQKghUQ" alt="">
            </div>
            <div class="col-8">
                <h2> ${ restau.restaurantName } </h2>
                <div class="restau-review"> <p>Note : ${ this.reviewsAverage(restau) }</p> <img src="../img/star.svg">  </div>
                <img class="close" src="../img/close.svg">
            </div>
        </div>
        `;

        for (let i = 0; i < restau.ratings.length; i++) {
            document.getElementById('popup-reviews').innerHTML += `
            <div class="review ">
            <div class="number"> <p>${restau.ratings[i].stars}</p> <img src="../img/star.svg">  </div>
            <p> ${restau.ratings[i].comment} </p>
            </div>
            `;
        }

        //Au clic sur la croix on masque les avis
        $(".close").click(function () {
            document.getElementById('popup-reviews').style.opacity = 0;
            document.getElementById('popup-reviews').style.zIndex = -1;
        });
    }

    addReview(index) {
        document.getElementById('popup-add-review').style.display= "block";

        document.getElementById('submit').addEventListener("click", (event) => {
            event.preventDefault();
            
            let stars = document.getElementById('addstars').value.trim();
            let comment = document.getElementById('addcomment').value.trim();

            if (stars !== "" && comment !== "") {
                this.data[index].ratings.push({
                    stars: parseInt(stars),
                    comment: comment
                });
                
           document.getElementById('popup-add-review').style.display= "none";
            document.getElementById('restau-average' + index).textContent = this.reviewsAverage(this.data[index]);
                
                
            } else {
                alert("Remplissez les champs");
            }

        });
        
        

    }


}
