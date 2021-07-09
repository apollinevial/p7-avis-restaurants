import{Themap} from "./map.js"
//Création de l'objet map

let themap = new Themap();

//Génération de la Google map
function initMap() {
    themap.createMap();
}

window.initMap = initMap;
