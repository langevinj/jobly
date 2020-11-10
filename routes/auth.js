
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const makeToken = require("../helpers/makeToken");

/** POST /login, create new user and return JWT with username and 
 * whether or not user is admin*/

router.post("/login", async function (req, res, next) {
    try {
        const user = await User.authenticate(req.body);
        const token = makeToken(user);
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});



module.exports = router;