const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/user');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const secret = "my_secret_key";

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");

        if (isValid) {
            error = null;
        }
        callback(error, 'backend/images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        callback(null, name + '-' + Date.now() + '.' + ext);
    }
});

/**
 * Get User by Id
 */
router.get("/:id",
    checkAuth,
    (req, res, next) => {
        User.findById(req.params.id)
            .then(result => {
                res.status(200).json({
                    message: "User fetch successfully",
                    user: {
                        id: result._id,
                        phonenumber: result.phonenumber,
                        address: result.address,
                        name: result.name,
                        avatar: result.avatar,
                        static_code: result.static_code
                    }
                });
            })
            .catch(error => {
                res.status(404).json({
                    error: error
                });
            });
    });

/**
 * Get User by Phonenumber
 */
router.get("/by_phonenumber/:phonenumber",
    checkAuth,
    (req, res, next) => {
        User.findOne({ "phonenumber": req.params.phonenumber })
            .then(result => {
                if (!result) {
                    throw new Error();
                }
                console.log(result);

                res.status(200).json({
                    message: "User fetch successfully",
                    user: {
                        id: result._id,
                        phonenumber: result.phonenumber,
                        address: result.address,
                        name: result.name,
                        avatar: result.avatar,
                        static_code: result.static_code
                    }
                });
            })
            .catch(error => {
                res.status(404).json({
                    error: "Phone number not found"
                });
            });
    });

/**
 * Get User by Static code
 */
router.get("/by_static_code/:static_code",
    checkAuth,
    (req, res, next) => {
        User.find({ "static_code": req.params.static_code })
            .then(result => {
                if (!result) {
                    throw new Error();
                }

                res.status(200).json({
                    message: "User fetch successfully",
                    result: result.map(user => {
                        return {
                            _id: user._id,
                            phonenumber: user.phonenumber,
                            name: user.name,
                            avatar: user.avatar,
                            address: user.address,
                            static_code: user.static_code
                        }
                    }),
                });
            })
            .catch(error => {
                res.status(404).json({
                    error: "Invalid code!"
                });
            });
    });

router.post("/sign_up", (req, res, next) => {
    const user = new User({
        phonenumber: req.body.phonenumber,
        password: req.body.password,
        name: req.body.phonenumber,
        avatar: "https://scontent.fhan3-1.fna.fbcdn.net/v/t1.0-9/43096004_2100121983332304_5007236297182412800_o.jpg?_nc_cat=102&_nc_ht=scontent.fhan3-1.fna&oh=4deebc1b11640aa8462a8e5f1c01f945&oe=5C71603B",
        address: null,
        static_code: null,
        lastest_location: null
    });
    user.static_code = user._id.toString().toLowerCase().split("").reverse().join("").substring(0, 5);

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

router.patch("/update/:id",
    [checkAuth, multer({ storage: storage }).single("image")],
    (req, res, next) => {

        // modify name
        let reqData = {
            name: req.body.name,
        }

        let imagePath = "";
        // modify avatar
        if (req.file) {
            const url = req.protocol + "://" + req.get("host");
            imagePath = url + "/images/" + req.file.filename;

            reqData = {
                name: req.body.name,
                avatar: imagePath
            }
        }

        if (req.body.address) {
            reqData = {
                address: req.body.address
            }
        }

        User.updateOne({ _id: req.params.id },
            reqData,
            { new: true })
            .then(result => {
                // console.log(result)
                res.status(201).json({
                    message: "Update succesfully!",
                    imagePath: imagePath
                });
            })
            .catch(error => {
                res.status(500).json({
                    error: error
                });
            });
    });

module.exports = router;