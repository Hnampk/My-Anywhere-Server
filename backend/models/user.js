const mongoose = require('mongoose');
const Post = require('./post');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    phonenumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: {
        type: { lat: Number, lng: Number, content: String },
        // default: {lat: 0, lng: 0, content: ""}
    }
});

// throw an Error when the phonenumber already exist
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);