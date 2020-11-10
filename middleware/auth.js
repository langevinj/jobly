/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Authenticate JWT token, add auth'd user (if any) to req.  */

function authenticateJWT(req, res, next) {
    try {
        const tokenFromBody = req.body.token

        let token = jwt.verify(tokenFromBody, SECRET_KEY);
        res.locals.username = token.username
        return next();
    } catch(err) {
        return next(new ExpressError("Unauthenticated", 401));
    }
}

function ensureLoggedIn(req, res, next) {
    if(!req.user) {
        const e = new ExpressError("Unauthorized", 401);
        return next(e);
    } else {
        return next();
    }
}


module.exports = {
    authenticateJWT,
    ensureLoggedIn
};