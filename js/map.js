class Themap {
    constructor() {
        this.map = null;
        this.infoWindow = null;
        this.markers = [];
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

        //Afficher tous les restaurants au départ
        this.showDatas(data);

        //Afficher les restaurants filtrés
        this.filter(data);
    }

    //Method moyenne notes d'un restaurant
    reviewsAverage(data) {
        //création d'un tableau qui rassemble toutes les notes
        let sum = 0;
        for (let i = 0; i < data.ratings.length; i++) {
            sum += Number(data.ratings[i].stars);
        }
        return sum / data.ratings.length;
    }


    //Method affichage restaurants
    showDatas(data) {

        for (let i = 0; i < data.length; i++) {

            //Créer le marker associé sur la Google map
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
            
            let addRating = document.createElement('div');
            addRating.innerHTML += `
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-whatever="@mdo">Ajouter un avis</button>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">New message</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="mb-3">
            <label for="recipient-name" class="col-form-label">Recipient:</label>
            <input type="text" class="form-control" id="recipient-name">
          </div>
          <div class="mb-3">
            <label for="message-text" class="col-form-label">Message:</label>
            <textarea class="form-control" id="message-text"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Send message</button>
      </div>
    </div>
  </div>
</div>

            `
            /*addRating.id = 'newrating' + i;
            addRating.className = 'avis';*/
            
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
            myRestaurantAverage.appendChild(addRating);

            document.getElementById('restaurants').appendChild(myRestaurant);

            //Au clic sur le bouton "Voir les avis" le détail des avis s'affiche 
            document.getElementById('average' + i).addEventListener("click", (event) => {
                event.stopPropagation();
                this.showReviews(data[i])
            });
        }
    }

    //Method filtrer les restaurants par note
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


    //Method popup avis d'un restaurant
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
    
    addRating(data){
        
        document.getElementById('test').innerHTML += `
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
`;
        
    }
    
    
}
