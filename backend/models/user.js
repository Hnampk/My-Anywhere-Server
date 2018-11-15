const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    phonenumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    address: {
        type: { lat: Number, lng: Number, content: String },
        // default: {lat: 0, lng: 0, content: ""}
    },
    static_code: {type: String, required: true},
    lastest_location: {
        type: {lat: Number, lng: Number, address: String, time: Number}
    }
});

// throw an Error when the phonenumber already exist
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);