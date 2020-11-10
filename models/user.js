//Model for User class
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User{
    /* authenticate user with username, password. Returns user */
    static async authenticate(data){

        const result = await db.query(
            `SELECT username,
                    pwd,
                    first_name,
                    last_name,
                    email,
                    photo_url,
                    is_admin
                FROM users
                WHERE username = $1`,
                [data.username]
        );

        const user = result.rows[0];

        if(user) {
            const isValid = await bcrypt.compare(data.pwd, user.pwd)
            if(isValid){
                return user;
            }
        }

        throw ExpressError("Invalid Password", 401)
    }

    /** register a new user ------ returns
     *      {username, hashed_pwd, first_name, last_name}
     */

     static async register({username, pwd, first_name, last_name, email, photo_url="", is_admin=false}){
        const hashed_pwd = await bcrypt.hash(pwd, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users (username, pwd, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, is_admin`,
            [username, hashed_pwd, first_name, last_name, email, photo_url, is_admin]
        );

        return result.rows[0]
     }

     //return an array of all users 
     static async all(){
         const result = await db.query(`SELECT username, first_name, last_name, email FROM users`);
         return result.rows;
     }

     //get a users by their username and return all fields excludingm password
     static async get(username){
         const result = await db.query(
             `SELECT username,
                    first_name,
                    last_name,
                    email,
                    photo_url
                FROM users
                WHERE username = $1`,
                [username]);

         if (!result.rows[0]) {
             throw new ExpressError(`No such user with username: ${username}`, 404);
         }

         return result.rows[0]
     }

     /** Update an existing user and return all fields exlcuding the password
      */

     static async update(username, data){
         let response = sqlForPartialUpdate("users", data, "username", username);

         const result = await db.query(response.query, response.values);

         if (!result.rows[0]) {
             throw new ExpressError(`No such user with username: ${username}`, 404);
         }

         let user = result.rows[0];

         //remove these fields from the return statement
         delete user['pwd'];
         delete user['is_admin'];

         return user
     }

     /** Remove an existing user and return
      *     "User deleted"
      */

      static async remove(username){
          const result = await db.query(
            `DELETE FROM users WHERE username = $1
            RETURNING username`,
            [username]);
            
          if (!result.rows[0]) {
              throw new ExpressError(`No such user with username: ${username}`, 404);
          }

          return "User deleted"
      }

}

module.exports = User;