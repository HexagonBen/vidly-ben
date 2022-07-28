const jwt = require("jsonwebtoken")
const config = require("config")

// this function enforces authorization for any HTTP methods that alter data on the server.
function auth(req, res, next) {
    const token = req.header("x-auth-token")
    if (!token) return res.status(401).send("Access denied. No token provided.")

    try {
        // if token is valid it returns the decoded payload
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"))
        req.user = decoded
        // the next method passes 
        next()
    }
    catch (ex) {
        res.status(400).send("Invalid token.")
    }
}

module.exports = auth