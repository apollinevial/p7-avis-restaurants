class Themap {
    constructor() {
        this.map = null;
        this.lat = 48.8737815;
        this.lng = 2.3501649;
        this.service = null;
        this.markers = [];
        this.data = null;
        this.coordoneees = null;
        this.submitReview();
        this.submitRestaurant();
        this.indexActif = 0;
    }


    /**
     * Création de la  carte.
     */
    createMap() {

        const getCoords = () => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject)
            })
        }

        const getLocation = async () => {
            let position = await getCoords();

            let geolocationLat = position.coords.latitude;
            let geolocationLng = position.coords.longitude;

            //Si les coordonnées renvoient un lieu existant alors on change les variables lat et lng sinon on garde celles de Paris
            if (geolocationLat !== null && geolocationLng !== null) {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
            }
        };
 
        getLocation().then(res => {

            this.map = new google.maps.Map(document.getElementById("map"), {
                center: {
                    lat: this.lat,
                    lng: this.lng
                },
                zoom: 10,
                mapId: '6f02331cadafb87d'
            });

            //Recherche de restaurants à proximité
            let request = {
                location: this.map.center,
                radius: '500',
                type: ['restaurant']
            };

            //Affichage des infos des restaurants à proximité
            this.service = new google.maps.places.PlacesService(this.map);
            this.service.nearbySearch(request, (results, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    this.showRestaurant(results);
                }
            });

            //Au click sur un lieu on ouvre la popup pour ajouter un restaurant
            this.map.addListener("click", (e) => {
                event.stopPropagation();
                document.getElementById('addname').value = "";
                this.addNewRestaurant();
                this.coordoneees = e.latLng;
            });

            //Lorsqu'on se déplace, on recherche les restaurants autour du lieu sur lequel on est positionné
            this.map.addListener("dragend", () => {

                let changement = this.map.getCenter();

                let latitude = changement.lat();
                let longitude = changement.lng();

                this.map.setCenter(new google.maps.LatLng(latitude, longitude), 20);

                //Recherche de restaurants à proximité
                let request = {
                    location: this.map.center,
                    radius: '1000',
                    type: ['restaurant']
                };

                let element = document.getElementById("restaurants");
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }

                for (let i = 0; i < this.markers.length; i++) {
                    this.markers[i].setMap(null);
                }

                this.markers = [];

                this.data = null;

                this.service = new google.maps.places.PlacesService(this.map);
                this.service.nearbySearch(request, (results, status) => {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {

                        this.showRestaurant(results);
                    }
                });

            });
        });
    }


    /**
    * Appel methodes qui affichent infos restaus + filtre.
    * @param {object} data - Tableau de données des restaurants.
    */
    showRestaurant(data) {

        this.data = data;

        this.showDatas();

        this.filter();
    }

    
    /**
    * Affichage infos restaurants.
    */
    showDatas() {

        for (let i = 0; i < this.data.length; i++) {

            this.data[i].ratings = [];

            //Création tableau avis ajoutés à la main
            this.data[i].newratings = [];

            this.OnlineReviews(this.data[i]);

            const marker = new google.maps.Marker({
                position: this.data[i].geometry.location,
                icon: "../img/picto-restau.png",
                map: this.map,
            });
            this.markers.push(marker);

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

            //Au clic sur le bouton "Ajouter un avis" la popup s'ouvre
            document.getElementById('add-restau-review' + i).addEventListener("click", (event) => {
                event.stopPropagation();
                document.getElementById('addstars').value = "";
                document.getElementById('addcomment').value = "";
                this.addReview(i);
            });
        }
    }


    /**
    * Filtrer les restaurants.
    */
    filter() {

        document.getElementById('btnfiltre').addEventListener("click", (event) => {
            event.stopPropagation();

            let min = document.getElementById("min").value;
            let max = document.getElementById("max").value;

            //On vérifie que les valeurs min et max sont comprises entre 1 et 5
            if ((min > 0 && min <= 5) && (max > 0 && max <= 5) && (min < max)) {
                document.getElementById('nofilter').style.display = 'none';

                for (let i = 0; i < this.data.length; i++) {

                    //On récupère la moyenne
                    let average = this.reviewsAverage(this.data[i]);

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


    
    /**
    * Récuperation avis en ligne.
    * @param {object} restau - 1 élément restaurant du tableau des restaurants.
    */
    OnlineReviews(restau) {

        let request = {
            placeId: restau.place_id,
        };

        this.service = new google.maps.places.PlacesService(this.map);
        this.service.getDetails(request,
            (place, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $.each(place.reviews, function (i, f) {

                        restau.ratings.push({
                            stars: Number(f.rating),
                            comment: f.text
                        });
                    });
                }
            });
    }


    /**
    * Calcul moyenne notes d'un restaurant.
    * @param {object} restau - 1 élément restaurant du tableau des restaurants.
    */
    reviewsAverage(restau) {

        //Si on a que les avis récupérés en ligne
        if (restau.rating && restau.newratings.length == 0) {

            //On affiche la propriété "rating" de notre restaurant
            return restau.rating;

            //Si on a que des avis rentrés à la main via la popup
        } else if (typeof restau.rating == 'undefined' && restau.newratings.length !== 0) {
            //On calcule la moyenne des avis ajoutés
            let sum = 0;
            for (let i = 0; i < restau.newratings.length; i++) {
                sum += restau.newratings[i];
            }
            let new_ratings = sum;

            let newReviewsAverage = new_ratings / restau.newratings.length;

            return newReviewsAverage.toFixed(1);

            //Si on a des avis récupérés en ligne et des avis rentrés à la main via la popup
        } else if (restau.rating && restau.newratings.length !== 0) {
            
            let user_ratings_total = restau.user_ratings_total;
            let user_ratings = restau.rating;
            let user_average = user_ratings_total * user_ratings;

            let new_ratings_total = restau.newratings.length;

            let sum = 0;
            for (let i = 0; i < new_ratings_total; i++) {
                sum += restau.newratings[i];
            }
            let new_ratings = sum;

            //On divise la somme des avis en ligne + ajoutés par le nombre d'avis en ligne + ajoutés
            let newReviewsAverage = (user_average + new_ratings) / (user_ratings_total + new_ratings_total);

            return newReviewsAverage.toFixed(1);

        } else {
            return "Aucun avis";
        }
    }


    /**
    * Popup avis d'un restaurant.
    * @param {object} restau - 1 élément restaurant du tableau des restaurants.
    */
    showReview(restau) {
        
        let restauLat = null;
        let restauLng = null;

        //Récupération propriétés lat et lng
        //Si notre propriété est un fonction (C'est le cas pour les avis en ligne)
        if (typeof (restau.geometry.location.lat) === 'function') {
            restauLat = restau.geometry.location.lat();
            restauLng = restau.geometry.location.lng();
            //Sinon 
        } else {
            restauLat = restau.geometry.location.lat;
            restauLng = restau.geometry.location.lng;
        }

        document.getElementById('popup-reviews').style.opacity = 1;
        document.getElementById('popup-reviews').style.zIndex = 99;

        document.getElementById('popup-reviews').innerHTML = `
                <div class="row intro">
                    <div class="col-4">
                        <img src="https://maps.googleapis.com/maps/api/streetview?location=${restauLat},${restauLng}&size=456x456&key=AIzaSyDBfmbrD5_qsRTRmHXRd_vOb1xR_kJ8B0o" alt="">
                    </div>
                    <div class="col-8">
                        <h2> ${ restau.name } </h2>
                        <div class="restau-review"> <p>Note : ${ this.reviewsAverage(restau) }</p> <img src="../img/star.svg">  </div>
                        <img class="close" src="../img/close.svg">
                    </div>
                </div>
                <div id="reviews-list">
                </div>
                `;

        for (let i = 0; i < restau.ratings.length; i++) {
            document.getElementById('reviews-list').innerHTML += `
                    <div class="review ">
                    <div class="number"> <p>${restau.ratings[i].stars}</p> <img src="../img/star.svg">  </div>
                    <p> ${restau.ratings[i].comment} </p>
                    </div>
                    `;
        }

        $(".close").click(function () {
            document.getElementById('popup-reviews').style.opacity = 0;
            document.getElementById('popup-reviews').style.zIndex = -1;
        });
    }


    /**
    * Affichage formulaire ajout avis.
    * @param {number} index - numéro dans le tableau du restaurant sur lequel on a cliqué.
    */
    addReview(index) {
        document.getElementById('popup-add-review').style.display = "block";

        document.getElementById('popup-title').textContent = this.data[index].name;

        document.getElementById('close-popup').addEventListener("click", (event) => {
            event.preventDefault();
            document.getElementById('popup-add-review').style.display = "none";
        });

        this.indexActif = index;
    }


    /**
    * Validation formulaire ajout avis.
    */
    submitReview() {
        document.getElementById('submit1').addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            let stars = document.getElementById('addstars').value.trim();
            let comment = document.getElementById('addcomment').value.trim();

            if (stars !== "" && stars > 0 && stars <= 5 && comment !== "") {
                this.data[this.indexActif].ratings.push({
                    stars: Number(stars),
                    comment: comment
                });

                //On ajoute la note au tableau des avis ajoutés à la main
                this.data[this.indexActif].newratings.push(Number(stars));

                document.getElementById('popup-add-review').style.display = "none";

                document.getElementById('restau-average' + this.indexActif).textContent =
                //On recalcule la moyenne et on l 'ajoute dans la colonne de gauche
                this.reviewsAverage(this.data[this.indexActif]);
                //On affiche la popup
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


    /**
    * Ajout d'un nouveau restaurant au clic.
    */
    addNewRestaurant() {

        document.getElementById('popup-add-restaurant').style.display = "block";

        document.getElementById('close-popup2').addEventListener("click", (event) => {
            event.preventDefault();
            document.getElementById('popup-add-restaurant').style.display = "none";
        });
    }

    
    /**
    * Validation formulaire ajout restau.
    */
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
                            name: newname,
                            geometry: {
                                location: {
                                    lat: this.coordoneees.lat(),
                                    lng: this.coordoneees.lng()
                                }
                            },
                            vicinity: location
                        });

                        const newmarker = new google.maps.Marker({
                            position: this.coordoneees,
                            map: this.map,
                            icon: "../img/picto-restau.png",
                        });
                        this.markers.push(newmarker);

                        this.map.panTo(this.coordoneees);

                        let last = this.data.length - 1;

                        this.data[last].ratings = [];

                        this.data[last].newratings = [];

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

                        myRestaurantName.textContent = this.data[last].name;
                        myRestaurantAverage.textContent = "Aucun avis";
                        showRestaurantReview.textContent = 'Voir les avis';
                        addRestaurantReview.textContent = 'Ajouter un avis';
                        myRestaurantAddress.textContent = this.data[last].vicinity;

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
                    console.log(err);
                }
            };

            restaurantAddress();
            event.preventDefault();

            let newname = document.getElementById('addname').value.trim();

        });
    }

}
