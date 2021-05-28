class Themap {
    constructor() {
        this.map = null;
        this.service = null;
        this.geocoder = null;
        this.infoWindow = null;
        this.markers = [];
        this.data = null;
        this.coordoneees = null;
        this.submitReview();
        this.submitRestaurant();
        this.indexActif = 0;
        this.review = true;
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

        let request = {
            location: this.map.center,
            radius: '500',
            type: ['restaurant']
        };

        this.service = new google.maps.places.PlacesService(this.map);
        this.service.nearbySearch(request, (results, status)=> {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(results);
                this.showRestaurant(results);
            }
        });

        //Géolocalisation et affichage de l'utilisateur
        this.showUser();

        //Au click sur un lieu ajout d'un restaurant
        this.map.addListener("click", (e) => {
            event.stopPropagation();
            document.getElementById('addname').value = "";
            this.addNewRestaurant(e.latLng, this.map);
            this.coordoneees = e.latLng;
        });
    }


    /*callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results);
            this.showRestaurant(results);

        }
    }*/


    //Method Ajout d'un nouveau restaurant au clic
    addNewRestaurant(latLng, map) {



        document.getElementById('popup-add-restaurant').style.display = "block";

        document.getElementById('close-popup2').addEventListener("click", (event) => {
            event.preventDefault();
            document.getElementById('popup-add-restaurant').style.display = "none";
        });
    }


    //Method Géolocalisation et affichage de l'utilisateur sur la carte
    showUser() {

        /*Géolocalisation*/
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
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
        /*if (restau.ratings.length !== 0) {
            //création d'un tableau qui rassemble toutes les notes
            let sum = 0;
            for (let i = 0; i < restau.ratings.length; i++) {
                sum += Number(restau.ratings[i].stars);
            }
            let result = sum / restau.ratings.length;
            return result.toFixed(2);
        } else {
            this.review = false;
            return "Aucun avis";
        }*/
    }


    //Method affichage restaurants
    showDatas() {

        for (let i = 0; i < this.data.length; i++) {

            //Créer le marker associé sur la Google map
            const marker = new google.maps.Marker({
                position: {
                    lat: this.data[i].geometry.location.lat,
                    lng: this.data[i].geometry.location.long
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

            myRestaurantName.textContent = this.data[i].name;
            myRestaurantAverage.textContent = this.reviewsAverage(this.data[i]);
            showRestaurantReview.textContent = 'Voir les avis';
            addRestaurantReview.textContent = 'Ajouter un avis';
            myRestaurantAddress.textContent = this.data[i].vicinity;

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
                event.stopPropagation();
                this.showReview(this.data[i]);
            });

            //Au clic sur le bouton "Ajouter un avis" la popup s'affiche 
            document.getElementById('add-restau-review' + i).addEventListener("click", (event) => {
                event.stopPropagation();
                document.getElementById('addstars').value = "";
                document.getElementById('addcomment').value = "";
                this.addReview(i);
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

            if ((min > 0 && min <= 5) && (max > 0 && max <= 5) && (min < max)) {
                document.getElementById('nofilter').style.display = 'none';

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
            } else {
                if (min > max) {
                    document.getElementById("nofilter").innerHTML = "Le nombre minimum ne peut pas être supérieur au nombre maximum";
                    document.getElementById('nofilter').style.display = 'block';
                } else if (min < 1 || min > 5) {
                    document.getElementById("nofilter").innerHTML = "Veuillez saisir des nombres entre 1 et 5";
                    document.getElementById('nofilter').style.display = 'block';
                } else if (max < 1 || max > 5) {
                    document.getElementById("nofilter").innerHTML = "Veuillez saisir des nombres entre 1 et 5";
                    document.getElementById('nofilter').style.display = 'block';
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
        document.getElementById('popup-add-review').style.display = "block";

        document.getElementById('popup-title').textContent = this.data[index].restaurantName;

        document.getElementById('close-popup').addEventListener("click", (event) => {
            event.preventDefault();
            document.getElementById('popup-add-review').style.display = "none";
        });

        this.indexActif = index;
    }

    submitReview() {
        document.getElementById('submit1').addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            let stars = document.getElementById('addstars').value.trim();
            let comment = document.getElementById('addcomment').value.trim();

            if (stars !== "" && stars > 0 && stars <= 5 && comment !== "") {
                this.data[this.indexActif].ratings.push({
                    stars: parseInt(stars),
                    comment: comment
                });

                document.getElementById('popup-add-review').style.display = "none";

                document.getElementById('restau-average' + this.indexActif).textContent = this.reviewsAverage(this.data[this.indexActif]);
                this.showReview(this.data[this.indexActif]);

            } else if (comment == "") {
                document.getElementById('errorcomment').innerHTML = "Ce champ est obligatoire";
            } else if (stars == "") {
                document.getElementById('errorstars').innerHTML = "Ce champ est obligatoire";
            } else if (stars < 1 || stars > 5) {
                document.getElementById('errorstars').innerHTML = "Entrez un nombre entre 1 et 5";
            } else {
                alert("Remplissez tous les champs et assurez-vous que le nombre d'étoiles est bien compris entre 1 et 5");
            }

        });
    }

    submitRestaurant() {


        document.getElementById('submit2').addEventListener("click", (event) => {

            const getAddress = address => {
                return new Promise((resolve, reject) => {

                    let geocoder = new google.maps.Geocoder();

                    const latlng = {
                        lat: this.coordoneees.lat(),
                        lng: this.coordoneees.lng(),
                    };

                    geocoder.geocode({
                        location: latlng
                    }, (results, status) => {
                        if (status === 'OK') {
                            resolve(results[0].formatted_address);
                        } else {
                            reject(status);
                        }
                    });
                });
            };

            const restaurantAddress = async () => {

                try {
                    let location = await getAddress();

                    if (newname !== "") {
                        this.data.push({
                            restaurantName: newname,
                            lat: this.coordoneees.lat(),
                            long: this.coordoneees.lng(),
                            address: location,
                            ratings: []
                        });

                        const newmarker = new google.maps.Marker({
                            position: this.coordoneees,
                            map: this.map,
                            icon: "../img/picto-restau.png",
                        });
                        this.markers.push(newmarker);

                        this.map.panTo(this.coordoneees);

                        var last = this.data.length - 1;

                        //Afficher les informations du restaurant sur la section de gauche 
                        let myRestaurant = document.createElement('article');
                        myRestaurant.id = 'restau' + last;
                        let myRestaurantName = document.createElement('h2');
                        let myRestaurantReview = document.createElement('div');
                        let myRestaurantAverage = document.createElement('p');
                        myRestaurantAverage.className = 'restau-average';
                        myRestaurantAverage.id = 'restau-average' + last;

                        myRestaurantReview.className = 'restau-review';
                        myRestaurantReview.id = 'restau-review' + last;

                        let starImage = document.createElement('img');
                        starImage.src = '../img/star.svg';

                        let showRestaurantReview = document.createElement('button');
                        showRestaurantReview.id = 'show-restau-review' + last;
                        showRestaurantReview.className = 'avis';

                        let addRestaurantReview = document.createElement('button');
                        addRestaurantReview.id = 'add-restau-review' + last;
                        addRestaurantReview.className = 'avis';

                        let myRestaurantAddress = document.createElement('p');

                        myRestaurantName.textContent = this.data[last].restaurantName;
                        myRestaurantAverage.textContent = this.reviewsAverage(this.data[last]);
                        showRestaurantReview.textContent = 'Voir les avis';
                        addRestaurantReview.textContent = 'Ajouter un avis';
                        myRestaurantAddress.textContent = this.data[last].address;

                        myRestaurant.appendChild(myRestaurantName);
                        myRestaurant.appendChild(myRestaurantReview);
                        myRestaurant.appendChild(myRestaurantAddress);
                        myRestaurantReview.appendChild(myRestaurantAverage);
                        myRestaurantReview.appendChild(starImage);
                        myRestaurantReview.appendChild(showRestaurantReview);
                        myRestaurantReview.appendChild(addRestaurantReview);

                        document.getElementById('restaurants').appendChild(myRestaurant);

                        //Au clic sur le bouton "Voir les avis" le détail des avis s'affiche 
                        document.getElementById('show-restau-review' + last).addEventListener("click", (event) => {
                            event.stopPropagation();
                            this.showReview(this.data[last]);
                        });

                        //Au clic sur le bouton "Ajouter un avis" la popup s'affiche 
                        document.getElementById('add-restau-review' + last).addEventListener("click", (event) => {
                            event.stopPropagation();
                            document.getElementById('addstars').value = "";
                            document.getElementById('addcomment').value = "";
                            this.addReview(last);
                        });


                        document.getElementById('popup-add-restaurant').style.display = "none";

                    } else {
                        alert("Remplissez les champs");
                    }


                } catch (err) {
                    console.warn(err);
                }
            };

            restaurantAddress();
            event.preventDefault();

            let newname = document.getElementById('addname').value.trim();

        });

    }

    /*geocodeLatLng(map) {

        return new Promise((resolve, reject) => {

                let geocoder = new google.maps.Geocoder();

                const latlng = {
                    lat: this.coordoneees.lat(),
                    lng: this.coordoneees.lng(),
                };

                geocoder.geocode({
                    location: latlng
                }, (results, status) => {
                    if (status === "OK") {
                        if (results[0]) {
                            console.log("nouvelle-adresse " + results[0].formatted_address);
                            return results[0].formatted_address;
                            resolve(results[0].formatted_address);
                        } else {
                            return "Adresse non connue";
                            window.alert("No results found");
                            reject(status);
                        }
                    } else {
                        window.alert("Geocoder failed due to: " + status);
                        return "Adresse non connue";
                        reject(status);
                    }
                });
            });
        }

    }*/
}
