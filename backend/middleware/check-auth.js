const jwt = require('jsonwebtoken');

const secret = "my_secret_key";

module.exports = (req, res, next) => {
    try {
        // the request token will look like this: "Bearer this_is_my_token_adfasdfasdf"
        const token = req.headers.authorization.split(" ")[1];

        jwt.verify(token, "my_secret_key");
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Invalid token!"
        });
    }
}