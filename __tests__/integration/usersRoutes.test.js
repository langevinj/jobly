/**Testing for users.js routes
 * run tests like:
 *          jest usersRoutes.test.js
 */

//switch to test db
process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require('../../app');

const {
    TEST_DATA,
    afterEachHook,
    beforeEachHook,
    afterAllHook
} = require('./jest.config');


beforeEach(async function () {
    await beforeEachHook(TEST_DATA);
});

// remove console.error from tests designed to fail, can be commented out as needed
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
})



    /** GET /users => {users: [{username, first_name, last_name, email}, ...]} */

describe("GET /users", function () {
    test("can get a list containing one user", async function() {
        let response = await request(app).get("/users").send({token: TEST_DATA.userToken})
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


describe("GET /users/:username", function() {
    test("can get a user given their username", async function () {
        let response = await request(app).get("/users/testuser").send({ token: TEST_DATA.userToken })
       
        expect(response.body.user).toHaveProperty("jobs")
        expect(response.body.user.jobs[0]).toHaveProperty("application")
    });

    test("404 if user with the given username doesn't exist", async function(){
        let response = await request(app).get("/users/asdfghjkl").send({ token: TEST_DATA.userToken });

        expect(response.statusCode).toEqual(404);
    });
});


describe("POST /users", function() {
    test("registers a user", async function() {
        const response = await request(app).post("/users")
            .send({
                username: "testuser2",
                pwd: "def456",
                first_name: "John",
                last_name: "Smith",
                email: "johnsmith@gmail.com"});
        expect(response.body).toHaveProperty('token')
        expect(response.statusCode).toEqual(201);
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

// /** PATCH /:username updates an existing user => 
//  * {user: {username, first_name, last_name, email, photo_url}}
//  */

describe("PATCH /users/:username", function() {
    test("updates an existing user", async function() {
        const response = await request(app).patch("/users/testuser")
           .send({
               last_name: "updated",
               token: TEST_DATA.userToken
           });
       
        expect(response.body).toEqual({
            "user": {
                "username": "testuser",
                "first_name": "Test",
                "last_name": "updated",
                "email": "test@test.com",
                "photo_url": null
            }
        });
    });
    test("400 if parameters passed are not valid", async function() {
        const response = await request(app).patch("/users/testuser")
            .send({
                 middle_name: "testington",
                 token: TEST_DATA.userToken
            });
       
       expect(response.statusCode).toEqual(400);
    });
});

describe("DELETE /users/:username", function() {
    test("delete a user given a username", async function() {
        const response = await request(app).delete("/users/testuser").send({token: TEST_DATA.userToken})
        expect(response.body).toEqual({message: "User deleted"});
    });
    test("401 if a different user", async function() {
        const response = await request(app).delete("/users/asdfghjkl").send({ token: TEST_DATA.userToken })
        expect(response.statusCode).toEqual(401);
    });
});


afterEach(async function () {
    await afterEachHook();
});

afterAll(async function () {
    await afterAllHook();
});