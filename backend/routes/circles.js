const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Circle = require('../models/circle');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const secret = "my_secret_key";

/**
 * CREATE NEW CIRCLE
 */
router.post("/create", checkAuth, (req, res, next) => {
    const circle = new Circle({
        admin_id: req.body.admin_id,
        name: req.body.name,
        members: [req.body.admin_id]
    });

    console.log(circle);
    circle.save()
        .then(result => {
            res.status(201).json({
                message: "Circle created!",
                info: result
            });
        })
        .catch(error => {
            console.log("error", error)
            res.status(500).json({
                error: error
            });
        });
});

/**
 * FETCH CIRCLE
 * id: Circle Id
 */
router.get("/:circle_id", checkAuth, (req, res, next) => {
    Circle.findOne({ "_id": req.params.circle_id })
        .then(result => {
            res.status(200).json({
                message: "Route fetch successfully!",
                circle: result
            });
        });
});

/**
 * FETCH CIRCLE BY MEMBER ID
 */
router.get("/by_user_id/:user_id", checkAuth, (req, res, next) => {
    const user_id = req.params.user_id;

    Circle.find({ members: user_id })
        .then(result => {
            res.status(200).json({
                message: "Route fetch successfully!",
                circles: result
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

/**
 * ADD MEMBER TO CIRCLE
 * id: Circle Id
 * member doesnt exist in circle
 */
router.patch("/add_member/:circle_id", (req, res, next) => {
    const circle_id = req.params.circle_id;
    const member_id = req.body.member_id;

    Circle.findOneAndUpdate({ "_id": circle_id, "members": { $ne: member_id } },
        { $push: { members: member_id } },
        { new: true })
        .then(result => {
            if (!result) {
                Circle.findById(circle_id)
                    .then(result => {
                        // var io = req.app.get('socketio');
                    
                        // io.in("5be50b3696d4b56186a719fe").emit('new-location', { from: "sender_id", location: "location", circle_id: "5be50b3696d4b56186a719fe" });

                        res.status(201).json({
                            message: "Add member successfully!",
                            result: result
                        });
                    });
            }
            else {
                res.status(201).json({
                    message: "Add member successfully!",
                    result: result
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

/**
 * REMOVE MEMBER FROM CIRCLE
 * id: Circle Id
 */
router.patch("/remove_member/:circle_id", (req, res, next) => {
    const circle_id = req.params.circle_id;
    const member_id = req.body.member_id;

    Circle.findOneAndUpdate({ "_id": circle_id},
        { $pullAll: { members: [member_id] } },
        { new: true })
        .then(result => {
            res.status(201).json({
                message: "Update succesfully!",
                result: result
            });

            // if (!result) {
            //     Circle.findById(circle_id)
            //         .then(result => {
            //             res.status(201).json({
            //                 message: "Add member successfully!",
            //                 result: result
            //             });
            //         });
            // }
            // else {
            //     res.status(201).json({
            //         message: "Add member successfully!",
            //         result: result
            //     });
            // }
        })
        .catch(error => {
            console.log("something went wrong!!!")
            res.status(500).json({
                error: error
            });
        });
});

router.patch("/make_admin/:circle_id", (req, res, next) => {
    const circle_id = req.params.circle_id;
    const member_id = req.body.member_id;

    Circle.updateOne({ "_id": circle_id }, { "admin_id": member_id })
        .then(result => {
            res.status(201).json({
                message: "Update succesfully!"
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        })
});

module.exports = router;