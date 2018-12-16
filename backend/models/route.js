const mongoose = require('mongoose');

const routeSchema = mongoose.Schema({
    name: { type: String },
    circle_id: { type: String, required: true },
    locations: {
        type: [{
            _address: String,
            _lat: Number,
            _lng: Number,
            name: String,
            time: Number
        }]
    }
});

module.exports = mongoose.model("Route", routeSchema);