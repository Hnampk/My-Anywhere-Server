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
            res.status(500).json({
                error: error
            });
        });
});

/**
 * FETCH CIRCLE
 * id: Circle Id
 */
router.get("/:id", checkAuth, (req, res, next) => {
    Circle.findOne({ "_id": req.params.id })
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
router.patch("/add_member/:id", (req, res, next) => {
    const circle_id = req.params.id;
    const member_id = req.body.member_id;

    Circle.findOneAndUpdate({ "_id": circle_id, "members": { $ne: member_id } },
        { $push: { members: member_id } },
        { new: true })
        .then(result => {
            if (!result) {
                Circle.findById(circle_id)
                    .then(result => {
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

module.exports = router;