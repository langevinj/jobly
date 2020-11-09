//Routes for users

const express = require("express");

const User = require("../models/user");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

const router = new express.Router();


/** GET /users should return all users:
 *      {users: [{username, first_name, last_name, email},...]}
 */
router.get("/", async function (req, res, next) {
    try {
        const users = await User.all()

        return res.json({ users: users })
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
        const user = await User.register(req.body);

        return res.json({user: user})
    } catch (err) {
        return next(err);
    }
});

/** PATCH /users/:username update a user, return
 *      {user: {username, first_name, last_name, email, photo_url}}
 */

router.patch("/:username", async function (req, res, next) {
    try {
        const user = await User.update(req.params.username, req.body);

        return res.json({ user: user });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /users/:username remove existing user and return
 *      {message: "User deleted"}
 */

router.delete("/:username", async function (req, res, next) {
    try {
        const response = User.remove(req.params.username)

        return res.json({ message: response });
    } catch (err) {
        return next(err);
    }
});





module.exports = router;