/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Authenticate JWT token, add auth'd user (if any) to req.  */

function authenticateJWT(req, res, next) {
    try {
        const tokenFromBody = req.body.token || req.query.token;

        let token = jwt.verify(tokenFromBody, SECRET_KEY);
        res.locals.username = token.username
        return next();
    } catch(err) {
        return next(new ExpressError("Unauthenticated", 401));
    }
}

function ensureLoggedIn(req, res, next) {
    try{
        const tokenFromBody = req.body.token;

        let token = jwt.verify(tokenFromBody, SECRET_KEY)
        res.locals.username = token.username;
        
        if (token.username === req.params.username){
            return next();
        }
        
        throw new Error();
    } catch (err) {
        return next(new ExpressError("Unauthorized", 401))
    }
}

function ensureAdmin(req, res, next) {
    try{
        const tokenFromBody = req.body.token;

        let token = jwt.verify(tokenFromBody, SECRET_KEY)
        res.locals.username = token.username;
        res.locals.admin = token.is_admin;

        if(token.is_admin){
            return next();
        }
        throw new Error();
    } catch (err) {
        return next(new ExpressError("Unauthorized, not an admin", 401));
    }
}


module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin
};