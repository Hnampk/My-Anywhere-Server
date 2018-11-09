const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const secret = "my_secret_key";

router.get("", checkAuth, (req, res, next) => {

    const body = req.body;

    User.find()
        .then(documents => {
            res.status(200).json({
                message: "User fetched successfully",
                posts: documents
            });
        })
        .catch(error => {
            res.status(404).json({
                error: error
            })
        });
});

router.get("/:id",
    // checkAuth,
    (req, res, next) => {
        User.findById(req.params.id)
            .then(result => {
                res.status(200).json({
                    message: "User fetch successfully",
                    user: {
                        _id: result._id,
                        phonenumber: result.phonenumber,
                        address: result.address
                    }
                });
            })
            .catch(error => {
                res.status(404).json({
                    error: error
                });
            });
    });

router.post("/sign_up", (req, res, next) => {
    const user = new User({
        phonenumber: req.body.phonenumber,
        password: req.body.password,
        name: req.body.phonenumber,
        avatar: "https://scontent.fhan3-1.fna.fbcdn.net/v/t1.0-9/43096004_2100121983332304_5007236297182412800_o.jpg?_nc_cat=102&_nc_ht=scontent.fhan3-1.fna&oh=4deebc1b11640aa8462a8e5f1c01f945&oe=5C71603B",
        address: null
    });

    user.save()
        .then(result => {
            const token = jwt.sign({ phonenumber: user.phonenumber, userId: user._id }, secret);
            res.status(201).json({
                message: "User created!",
                token: token,
                info: result
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

router.post("/login", (req, res, next) => {
    User.findOne({ "phonenumber": req.body.phonenumber })
        .then(user => {
            // user doesnt not exist
            if (!user) {
                return res.status(401).json({
                    message: "This phone number did not sign up!"
                });
            }

            // password doesn't match
            if (user.password != req.body.password) {
                return res.status(401).json({
                    message: "Password does not match!"
                });
            }

            console.log(user);
            const token = jwt.sign({ phonenumber: user.phonenumber, userId: user._id }, secret);
            return res.status(200).json({
                message: "Login Successfully!",
                token: token,
                info: user
            });

        }).catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

router.patch("/update/:id", (req, res, next) => {
    User.updateOne({ _id: req.params.id }, req.body)
        .then(result => {
            res.status(201).json({
                message: "Update succesfully!",
            });
        });
});

module.exports = router;