const express = require('express');
const bodyParser = require('body-parser');
const Post = require('./models/post');
const mongoose = require('mongoose');
const usersRoute = require('./routes/users');
const md5 = require('md5');

const app = express();

mongoose.connect("mongodb+srv://nam:X44a5kXBWUBfflej@cluster0-bpl1k.mongodb.net/test?retryWrites=true")

app.use(bodyParser.json());

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
        "GET, POST"
    );
    next();
});

app.post("/api/posts", (req, res, next) => {
    let post = new Post({
        title: req.body.title,
        content: req.body.content
    });
    post.save().then(result => {
        console.log(result);

        res.status(201).json({
            message: "Posts added successfully",
            post: result
        });
    });
});

app.get("/api/posts", (req, res, next) => {
    console.log(md5('helloworld'));
    Post.find()
        .then(documents => {
            res.status(200).json({
                message: "Posts fetched successfully",
                posts: documents
            });
        })
        .catch(err => {
            console.log("ERROR: ", err);
        });

});

app.delete("/api/posts/:id", (req, res, next) => {
    Post.deleteOne({ _id: req.params.id })
        .then(result => {
            console.log(result);

            res.status(200).json({
                message: "Post deleted!"
            });
        })
})

// app.use((req, res, next) => {
//     res.send("Hello from express!");
// });

app.use("/api/users", usersRoute);

module.exports = app;