//Model for User class
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User{

    /** register a new user ------ returns
     *      {username, hashed_pwd, first_name, last_name}
     */

     static async register({username, pwd, first_name, last_name, email, photo_url="", is_admin=false}){
        const hashed_pwd = await bcrypt.hash(pwd, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users (username, pwd, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username`,
            [username, hashed_pwd, first_name, last_name, email, photo_url, is_admin]
        );

        return result.rows[0]
     }

}

module.exports = User;