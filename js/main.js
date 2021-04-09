let themap = new Themap();

function initMap() {
    themap.createMap();
}




/*FETCH*/
fetch('../restaurants.json').then(res => {

    if (res.ok) {
        res.json().then(data => {

            themap.showRestaurant(data);
        })

    } else {
        console.log("Erreur");
    }
})

function getValue() {
         var min = document.getElementById("min").value;
        console.log(min);   
    
             var max = document.getElementById("max").value;
        console.log(max); 
}