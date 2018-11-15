const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const socket = require('socket.io');
const usersRoute = require('./routes/users');
const circlesRoute = require('./routes/circles');
const routesRoute = require('./routes/routes');
const md5 = require('md5');

const app = express();

mongoose.connect("mongodb+srv://nam:X44a5kXBWUBfflej@cluster0-bpl1k.mongodb.net/test?retryWrites=true")
    .then(() => {

    })
    .catch(error => {
        console.log(error)
    });

app.use(bodyParser.json());
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT"
    );
    next();
});

app.use("/api/users", usersRoute);
app.use("/api/circles", circlesRoute);
app.use("/api/routes", routesRoute);

module.exports = app;