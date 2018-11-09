const mongoose = require('mongoose');

const routeSchema = mongoose.Schema({
    name: { type: String, required: true },
    circle_id: { type: String, required: true },
    locations: {
        type: [{
            address: String,
            lat: Number,
            lng: Number,
            name: String,
            time: Number
        }]
    }
});

module.exports = mongoose.model("Route", routeSchema);