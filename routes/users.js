//Routes for users

const express = require("express");

const User = require("../models/user");

const userSchema = require("../schema/userSchema");
const userPartialSchema = require("../schema/userPartialSchema");
const { ensureLoggedIn } = require("../middleware/auth");
const makeToken = require("../helpers/makeToken");
const validateSchema = require("../helpers/validateSchema");
const ExpressError = require("../helpers/expressError");

const router = new express.Router();


/** GET /users should return all users:
 *      {users: [{username, first_name, last_name, email},...]}
 */
router.get("/", async function (req, res, next) {
    try {
        const users = await User.all();
        return res.json({ users: users });
    } catch (err) {
        return next(err);
    }
});

/** GET /users/:username should return all non-pwd fields for a user
 *      {user: {username, first_name, last_name, email, photo_url}}
 */
router.get("/:username", async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        if(!user){
            throw new ExpressError(`No such user with username: ${req.params.username}`, 404);
        }
        return res.json({ user: user });
    } catch (err) {
        return next(err);
    }
});



/** POST /users registers a user returns
 *              {user: username}
 */
router.post("/", async function(req, res, next) {
    try{
        validateSchema(req, userSchema);
        const user = await User.register(req.body);
        const token = makeToken(user);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /users/:username update a user, return
 *      {user: {username, first_name, last_name, email, photo_url}}
 */

router.patch("/:username", ensureLoggedIn, async function (req, res, next) {
    try {
        validateSchema(req, userPartialSchema);
        const user = await User.update(req.params.username, req.body);
        if(!user){
            throw new ExpressError(`No such user with username: ${req.params.username}`, 404);
        }
        return res.json({ user: user });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /users/:username remove existing user and return
 *      {message: "User deleted"}
 */

router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
    try {
        const response = await User.remove(req.params.username);
        if (!response) { 
            throw new ExpressError(`No such user with username: ${req.params.username}`, 404);
    }
        return res.json({ message: response });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;