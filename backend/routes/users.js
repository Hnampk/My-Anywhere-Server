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

router.get("/test/", (req, res, next) => {
    console.log("/api/test", req.body.time);
    var io = req.app.get('socketio');

    io.in("5be50b3696d4b56186a719fe").emit('new-location', { from: "sender_id", location: "location", circle_id: "5be50b3696d4b56186a719fe" });

    res.status(200).json({
        message: "OK"
    })
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
                        _id: result._id,
                        phonenumber: result.phonenumber,
                        address: result.address,
                        name: result.name,
                        avatar: result.avatar,
                        // static_code: result.static_code,
                        lastest_location: result.lastest_location,
                        wallet_address: result.wallet_address
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
                        static_code: result.static_code,
                        wallet_address: result.wallet_address
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
                    users: result.map(user => {
                        return {
                            _id: user._id,
                            phonenumber: user.phonenumber,
                            name: user.name,
                            avatar: user.avatar,
                            address: user.address,
                            static_code: user.static_code,
                            wallet_address: user.wallet_address
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
        avatar: "https://www.joshmorony.com/wp-content/uploads/2018/05/ionic-logo-white-200x200.png",
        address: null,
        static_code: null,
        lastest_location: null,
        wallet_address: ""
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

router.patch("/update_wallet_address/:id", (req, res, next) => {
    let reqData = {
        wallet_address: req.body.wallet_address
    }

    User.updateOne({ _id: req.params.id },
        reqData,
        { new: true })
        .then(result => {
            console.log(req.body.wallet_address);
            res.status(201).json({
                message: "Update succesfully!",
            });
        })
        .catch(error => {
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

        let image_path = "";
        // modify avatar
        if (req.file) {
            const url = req.protocol + "://" + req.get("host");
            image_path = url + "/images/" + req.file.filename;

            reqData = {
                name: req.body.name,
                avatar: image_path
            }
        }
        else if (req.body.address) {
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
                    image_path: image_path
                });
            })
            .catch(error => {
                res.status(500).json({
                    error: error
                });
            });
    });




module.exports = router;