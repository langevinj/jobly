
const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ExpressError = require("../helpers/expressError");
const db = require("../db");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config.js");
const User = require("../models/user");

const router = new express.Router();

/** POST /login, create new user and return JWT with username and 
 * whether or not user is admin*/

router.post("/login", async function (req, res, next) {
    
    try {
        const { username, password } = req.body;
        const user = await User.getPwd(username);
        // const result = await db.query(
        //     `SELECT pwd, is_admin FROM users WHERE username = $1`, [username]);
        // let user = result.rows[0]
        // console.log(user);
        if(user.pwd) {
            if (await bcrypt.compare(password, user.pwd) === true) {
                let payload = {"username": username, "is_admin": user.is_admin}
                let token = jwt.sign({ payload }, SECRET_KEY);
                return res.json({ token })
            }
        }
        throw new ExpressError ("Invalid Password", 400);
    } catch (err) {
        return next(err);
    }
});



module.exports = router;