let themap = new Themap();

function initMap() {
    themap.createMap();
}

/*FETCH*/
fetch('../restaurants.json').then(res => {

    if (res.ok) {
        res.json().then(data => {

            themap.showRestaurant(data);
return data;
            console.log(data)
        })

    } else {
        console.log("Erreur");
    }
})
