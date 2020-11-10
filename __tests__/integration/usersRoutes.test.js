/**Testing for users.js routes
 * run tests like:
 *          jest usersRoutes.test.js
 */

//switch to test db
process.env.NODE_ENV = "test";

const request = require("supertest");
const router = require("../../routes/companies");
const app = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/app.js");
const db = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/db.js");
const User = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/models/user.js");

describe("User Routes Test", function () {

    // remove console.error from tests designed to fail, can be commented out as needed
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    
    //clear out table and create sample data
    beforeEach(async function () {
        await db.query("DELETE FROM users");

        let u1 = await User.register({
            username: "testuser",
            pwd: "abc123",
            first_name: "Test",
            last_name: "Testy",
            email: "test@test.com",
            photo_url: "www.test.com"
        });

        // let u2 = await User.register({
        //     username: "testuser2",
        //     pwd: "def456",
        //     first_name: "John",
        //     last_name: "Smith",
        //     email: "johnsmith@gmail.com"
        // });
    });

    /** GET /users => {users: [{username, first_name, last_name, email}, ...]} */

    describe("GET /", function () {
        test("can get a list containing one user", async function() {
            let response = await request(app).get("/users")
            expect(response.body).toEqual({
                "users": [{
                    "username": "testuser",
                    "first_name": "Test",
                    "last_name": "Testy",
                    "email": "test@test.com"
                }]
            });
        });
    });

    /** GET /users/:username => {user: {username, first_name, last_name, email, photo_url}} */

    describe("GET /:username", function() {
        test("can get a user given their username", async function () {
            let response = await request(app).get("/users/testuser")

            expect(response.body).toEqual({
                "user": {
                    "username": "testuser",
                    "first_name": "Test",
                    "last_name": "Testy",
                    "email": "test@test.com",
                    "photo_url": "www.test.com"
                }
            });
        });

        test("404 if user with the given username doesn't exist", async function(){
            let response = await request(app).get("/users/asdfghjkl");

            expect(response.statusCode).toEqual(404);
        });
    });

    /** POST /users registers user and returns => {user: username} */

    describe("POST /", function() {
        test("registers a user", async function() {
            const response = await request(app).post("/users")
                .send({
                    username: "testuser2",
                    pwd: "def456",
                    first_name: "John",
                    last_name: "Smith",
                    email: "johnsmith@gmail.com"});
            expect(response.body).toEqual({user: {username: "testuser2"}})
            expect(response.statusCode).toEqual(201);

            //check that user was added to db
            const result = await User.all()
            expect(result.length).toEqual(2);
        });

        test("400 if params are invalid", async () => {
            let response = await request(app).post("/users")
                .send({
                    username: "testuser2",
                    pwd: "def456",
                    first_name: "John",
                    last_name: "Smith",
                    email: "johnsmith"
            });

            expect(response.statusCode).toEqual(400);
        });
    });

    /** PATCH /:username updates an existing user => 
     * {user: {username, first_name, last_name, email, photo_url}}
     */

     describe("PATCH /:username", function() {
         test("updates an existing user", async function() {
             const response = await request(app).patch("/users/testuser")
                .send({
                    last_name: "updated"
                });
            
             expect(response.body).toEqual({
                 "user": {
                     "username": "testuser",
                     "first_name": "Test",
                     "last_name": "updated",
                     "email": "test@test.com",
                     "photo_url": "www.test.com"
                 }
             });
         });

         test("400 if parameters passed are not valid", async function() {
             const response = await request(app).patch("/users/testuser")
                 .send({
                      middle_name: "testington"
                 });
            
            expect(response.statusCode).toEqual(400);
         });

         test("404 if username doesn't exist", async function() {
             const response = await request(app).patch("/users/asdfghhjkkl")
                 .send({
                     last_name: "testington"
                 });

             expect(response.statusCode).toEqual(404);
         });
     });

     /** DELETE /:username remove a user =>
      *     {message: "User deleted"}
      */

      describe("DELETE /:username", function() {
          test("delete a user given a username", async function() {
              const response = await request(app).delete("/users/testuser")

              expect(response.body).toEqual({message: "User deleted"});
          });

          test("404 if user doesn't exist", async function() {
              const response = await request(app).delete("/users/asdfghjkl")

              expect(response.statusCode).toEqual(404);
          });
      });


});