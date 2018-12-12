const http = require('http');
const debug = require('debug');
const socket = require('socket.io');
const app = require('./backend/app');
const User = require('./backend/models/user');

const normalizePort = val => {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return port;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};

const onError = error => {
    if (error.syscall != 'listen') {
        throw error;
    }

    const bind = typeof addr === "string" ? "pipe" + addr : "port" + port;

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges!");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe" + addr : "port" + port;

    debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "8080");
app.set('port', port)

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

// socket io
const io = socket(server);
server.listen(port);

io.sockets.on('connection', (socket) => {

    socket.on('disconnect', (something) => {
        console.log('user disconnected', something);
    });

    socket.on('join', (data) => {
        const circle_id = data.circle_id;
        const sender_id = data.sender_id

        socket.join(circle_id, () => {
            console.log("JOINED: ", data);

            io.in(circle_id).clients((error, client) => {

                if(error){
                    console.log("JOIN FAILED: ", error)
                }
            })
        });

    });

    socket.on('leave', (data) => {
        const circle_id = data.circle_id;
        const sender_id = data.sender_id

        socket.leave(circle_id, () => {
            console.log("User left: ", sender_id);
        });
    });

    socket.on('message', (data) => {
        io.in(data.circle_id).emit('new-message', { from: data.sender_id, message: data.message });
    });

    socket.on('update-location', (data) => {
        const sender_id = data.sender_id;
        const circles = data.circles; // array of circles id
        const location = data.location;

        // update user's lastest location in db
        User.updateOne({ _id: sender_id },
            { lastest_location: location })
            .then(result => {
                // console.log(result);
            })
            .catch(error => {
                console.log(error);
            });

        // emit event to all the circle rooms
        circles.forEach(element => {
            io.in(element).emit('new-location', { from: sender_id, location: location, circle_id: element });
        });
    });
});

// request to help application works background
app.use("/api/update_location", (req, res, next) => {
    const sender_id = req.body.sender_id;
    const circles = req.body.circles; // array of circles id
    const location = req.body.location;

    console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());

    // emit event to all the circle rooms
    circles.forEach(element => {
        io.in(element).emit('new-location', { from: sender_id, location: location, circle_id: element });
    });

    res.status(200).json({
        message: "success"
    });
});


app.use("/api/test", (req, res, next)=>{
    console.log("/api/test", req.body.time);

    res.status(200).json({
        message: "OK"
    })
});