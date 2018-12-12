const express = require('express');
const jwt = require('jsonwebtoken');
const Route = require('../models/route');
const Circle = require('../models/circle');

const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const secret = "my_secret_key";

/**
 * Create new route and save to circle by circleId
 * :id - Circle ID
 */
router.post("/create", (req, res, next) => {

    const route = new Route({
        name: req.body.name,
        circle_id: req.body.circle_id,
        locations: req.body.locations
    });

    route.save()
        .then(result => {
            Circle.findOneAndUpdate({ "_id": circleId },
                { route: result._id } )
                .then(() => {
                    res.status(201).json({
                        message: "Route created!",
                        route: result
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

router.get("/:id", (req, res, next) => {
    Route.findOne({ "_id": req.params.id })
        .then(result => {
            res.status(200).json({
                message: "Route fetch successfully!",
                route: result
            });
        });
});

router.patch("/update/:id", (req, res, next) => {
    const route = new Route({
        name: req.body.name,
        locations: req.body.locations
    });

    Route.updateOne({ "_id": req.params.id }, req.body)
        .then(result => {
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

router.get("", (req, res, next) => {
    Route.find({ "locations._id": "5be072f1082e254ce87b299e" })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Hello",
                result: result
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });
});

module.exports = router;