//Model for User class
const db = require("../db");
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
        //indicate an error in logging in
        return null
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

     //get a users by their username and return all fields excluding password
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
        //indicate no user found with that username
        if (!result.rows[0]) {
            return null
        }
        const jobs = await db.query(
            `SELECT title,
                   salary,
                   equity,
                   company_handle,
                   date_posted,
                   state,
                   created_at
           FROM users
           JOIN applications ON users.username = applications.username
           JOIN jobs ON applications.job_id = jobs.id
           WHERE users.username = $1`, [username]
        );


        let user = result.rows[0]
        let allJobs = jobs.rows
        let arrayOfJobs = []

        if(jobs.rows.length !== 0){
            for (let i = 0; i < allJobs.length; i++) {
                let tempJob = {
                    title: allJobs[i].title,
                    salary: allJobs[i].salary,
                    equity: allJobs[i].equity,
                    company_handle: allJobs[i].company_handle,
                    date_posted: allJobs[i].date_posted,
                    application: {
                        state: allJobs[i].state,
                        created_at: allJobs[i].created_at
                    }
                }
                arrayOfJobs.push(tempJob);
            }
        }

        user['jobs'] = arrayOfJobs
        

        return user
     }

     /** Update an existing user and return all fields exlcuding the password
      */

     static async update(username, data){
         if(data.token){
             delete data.token
         }
         let response = sqlForPartialUpdate("users", data, "username", username);

         const result = await db.query(response.query, response.values);
         //indicate no user found with given username
         if (!result.rows[0]) {
             return null
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
          //indicate no user for with given username
          if (!result.rows[0]) {
              return null
          }

          return "User deleted"
      }

}

module.exports = User;