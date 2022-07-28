
function checkAdmin(req, res, next) {
    // we can access req.user here because this function will come after the auth middleware function, which adds user to the req body
    // code 403 means "Forbidden", meaning the user cannot attempt to access the target resource again.
    if (!req.user.isAdmin) return res.status(403).send("Access denied")

    next();
}

module.exports = checkAdmin