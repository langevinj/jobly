/** Testing for jobs.js routes 
 * run tests like:
 *              jest jobsRoutes.test.js
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
beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
})

describe("GET /jobs", async function () {
    test("can get a list containing 2 jobs", async function() {
        let response = await request(app).get("/jobs").send({ token: TEST_DATA.userToken })
        expect(response.body).toEqual({
            "jobs": [
                {"title": "Customer Service","company_handle": "apple"}]
        });
    });
    test("can get a filtered list of jobs by a searched title", async function() {
        let response = await request(app).get("/jobs?search=Service").send({ token: TEST_DATA.userToken })
        expect(response.body).toEqual({
            "jobs": [
                { "title": "Customer Service", "company_handle": "apple" }]
        });
    });
    test("can get a filtered list of jobs by min_salary", async function() {
        let response = await request(app).get("/jobs?min_salary=20000").send({ token: TEST_DATA.userToken })
        expect(response.body).toEqual({
            "jobs": [
                { "title": "Customer Service", "company_handle": "apple" }]
        });
    });
    test("can get a filtered list of jobs by min_equity", async function(){
        let response = await request(app).get("/jobs?min_equity=0.3").send({ token: TEST_DATA.userToken })
        expect(response.body).toEqual({
            "jobs": [
                { "title": "Customer Service", "company_handle": "apple" }]
        });
    });
    test("can get a filtered list of jobs by multiple paramters", async function (){
        let response = await request(app).get("/jobs?title=Developer&min_equity=0.3&min_salary=15000").send({ token: TEST_DATA.userToken })
        expect(response.body).toEqual({
            "jobs": [
                { "title": "Customer Service", "company_handle": "apple" }]
        });
    });
});


describe("GET /jobs/:id", async function(){
    test("can get a job by its id", async function(){
        let response = await request(app).get(`/jobs/${TEST_DATA.jobId}`).send({ token: TEST_DATA.userToken })
        console.log(response.body)
        expect(response.body.job).toHaveProperty('equity')
        expect(response.body).toEqual({"job": {
            "title": "Customer Service",
            "salary": 40000,
            "equity": 0.5,
            "company": {
                "handle": "apple",
                "name": "Apple",
                "num_employees": 4000,
                "description": "Tech and computers",
                "logo_url": "www.apple.com"
            },
            "requirements": [],
            "date_posted": expect.any(String)
        }});
    });
    test("404 if no job with the given id", async function(){
        let response = await request(app).get("/jobs/99999").send({ token: TEST_DATA.userToken })
        expect(response.statusCode).toEqual(404)
    });
});


describe("POST /jobs", async function() {
    test("creates a new job give valid parameters", async function() {
        let response = await request(app).post(`/jobs`)
            .send({
                title: "UI Engineer",
                salary: 55000,
                equity: 0.4,
                company_handle: "apple",
                token: TEST_DATA.userToken
            });
        console.log(response.body)
        expect(response.body.job).toHaveProperty('title')
        // expect(response.body).toEqual({
        //     "job": {
        //         "title": "UI Engineer",
        //         "salary": 55000,
        //         "equity": 0.4,
        //         "company_handle": "apple",
        //         "requirements": "No requirements listed",
        //         "date_posted": expect.any(String)
        //     }
        // });
    });
    test("400 if parameters are not valid", async () => {
        let response = await request(app).post("/jobs")
            .send({
                title: "UI Engineer",
                salary: "55000",
                equity: 0.4,
                company_handle: "apple",
                token: TEST_DATA.userToken
            });
        
        expect(response.statusCode).toEqual(400);
    }); 
});

describe("PATCH /jobs/:id", async function() {
     test("updates an existing job", async function() {
         let response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`)
            .send({
                title: "CS specialist",
                salary: 50000,
                token: TEST_DATA.userToken
            });
        
        expect(response.body.job).toHaveProperty('salary');
     });
     test("400 if parameters passed are not valid", async function() {
         let response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`)
            .send({
                title: 400,
                salary: "50000",
                token: TEST_DATA.userToken
            });
        
        expect(response.statusCode).toEqual(400);
     });
     test("404 if job with id doesn't exist", async function(){
         let response = await request(app).patch(`/jobs/999999`)
             .send({
                 title: "CS specialist",
                 salary: 50000,
                 token: TEST_DATA.userToken
             });
        expect(response.statusCode).toEqual(404)
     });
});

describe("DELETE /jobs/:handle", async function() {
    test("delete a job given its id", async function(){
        let response = await request(app).delete(`/jobs/${TEST_DATA.jobId}`).send({token: TEST_DATA.userToken});
        expect(response.body).toEqual({"message": "Job deleted"});
    });
    test("404 if no job with given id exists", async function() {
        let response = await request(app).delete("/jobs/999999999").send({ token: TEST_DATA.userToken });
        expect(response.statusCode).toEqual(404);
    });
});

afterEach(async function () {
    await afterEachHook();
});

afterAll(async function () {
    await afterAllHook();
});