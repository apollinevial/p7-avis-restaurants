class Restaurant {
    constructor(name, address, location, image) {
        this.name = name;
        this.address = address;
        this.location = {
            latitude: null,
            longitude: null
        }
        this.reviewsAverage();
        this.image = image;
    }
    
    reviewsAverage() {
        
    }
}