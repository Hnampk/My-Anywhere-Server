const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    phonenumber: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

// throw an Error when the phonenumber already exist
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);