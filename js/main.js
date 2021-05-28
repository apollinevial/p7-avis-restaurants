//Création de l'objet map
let themap = new Themap();

//Génération de la Google map
function initMap() {
    themap.createMap();
}

/*
//Récupération des données json des restaurants
fetch('../restaurants.json').then(res => {

    if (res.ok) {
        res.json().then(data => {
            //Affichage des infos des restaurants
            themap.showRestaurant(data);
        })

    } else {
        console.log("Erreur");
    }
})
*/