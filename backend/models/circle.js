const mongoose = require('mongoose');
const Route = require('./route');

const circleSchema = mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId}]
});

module.exports = mongoose.model("Circle", circleSchema);