const mongoose = require('mongoose');
const Route = require('./route');

const circleSchema = mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    route: {
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
    },
    members: [{ type: mongoose.Schema.Types.ObjectId}]
});

module.exports = mongoose.model("Circle", circleSchema);