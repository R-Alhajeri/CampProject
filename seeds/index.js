const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedsHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
})
    .then(() => {
        console.log("Database Connected ! ");
    })
    .catch((err) => { 
        console.log("Error ! !");
        console.log(err);
    });
    
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) { 
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp =  new Campground({
            location: `${cities[rand1000].city},${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
             image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
           
        });
        
        await camp.save();
    };
};

seedDB().then(() => {
    mongoose.connection.close()
});