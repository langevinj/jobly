/** Testing for jobs.js routes 
 * run tests like:
 *              jest jobsRoutes.test.js
*/

//switch to test db
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/app.js");
const db = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/db.js");
const Company = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/models/company.js");
const Job = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/models/job.js");


describe("Job Routes Test", function () {

    
    // remove console.error from tests designed to fail, can be commented out as needed
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    //clear out table and create sample data
    beforeEach(async function () {
        await db.query("DELETE FROM companies");
        await db.query("DELETE FROM jobs")

        let c1 = await Company.create({
            handle: "apple",
            name: "Apple",
            num_employees: 4000,
            description: "Tech and computers",
            logo_url: "www.apple.com"
        });

        let j1 = await Job.create({
            title: "Customer Service",
            salary: 40000,
            equity: 0.5,
            company_handle: "apple"
        });
        
        let j2 = await Job.create({
            title: "Software Developer",
            salary: 80000,
            equity: 0.7,
            company_handle: "apple"
        });
    });

    /** GET /jobs => [{title, company_handle}, ...] */

    describe("GET /", function () {
        test("can get a list containing 2 jobs", async function() {
            let response = await request(app).get("/jobs")

            expect(response.body).toEqual({
                "jobs": [
                    {"title": "Customer Service","company_handle": "apple"}, 
                    {"title": "Software Developer","company_handle": "apple"}]
            });
        });

        test("can get a filtered list of jobs by a searched title", async function() {
            let response = await request(app).get("/jobs?search=Service")

            expect(response.body).toEqual({
                "jobs": [
                    { "title": "Customer Service", "company_handle": "apple" }]
            });
        });

        test("can get a filtered list of jobs by min_salary", async function() {
            let response = await request(app).get("/jobs?min_salary=55000")

            expect(response.body).toEqual({
                "jobs": [
                    { "title": "Software Developer", "company_handle": "apple" }]
            });
        });

        test("can get a filtered list of jobs by min_equity", async function(){
            let response = await request(app).get("/jobs?min_equity=0.5")

            expect(response.body).toEqual({
                "jobs": [
                    { "title": "Software Developer", "company_handle": "apple" }]
            });
        });

        test("can get a filtered list of jobs by multiple paramters", async function () {
            let response = await request(app).get("/jobs?title=Developer&min_equity=0.5&min_salary=30000")

            expect(response.body).toEqual({
                "jobs": [
                    { "title": "Software Developer", "company_handle": "apple" }]
            });
        });
    });

    /** GET /:id => {job: {jobData}} including company info */

    describe("GET /:id", function(){
        test("can get a job by its id", async function(){
            //Get the correct id for the param
            let result = await db.query('SELECT id FROM jobs LIMIT 1')
            let id = result.rows[0].id
            let response = await request(app).get(`/jobs/${id}`)

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
                "date_posted": expect.any(String)
            }});
        });

        test("404 if no job with the given id", async function(){
            let response = await request(app).get("/jobs/99999")

            expect(response.statusCode).toEqual(404)
        });
    });

    /** POST /jobs creates a new job => {job: jobData} */

    describe("POST /", function() {
        test("creates a new job give valid parameters", async function() {
            let response = await request(app).post(`/jobs`)
                .send({
                    title: "UI Engineer",
                    salary: 55000,
                    equity: 0.4,
                    company_handle: "apple"
                });

            expect(response.body).toEqual({
                "job": {
                    "title": "UI Engineer",
                    "salary": 55000,
                    "equity": 0.4,
                    "company_handle": "apple",
                    "date_posted": expect.any(String)
                }
            });
        });

        test("400 if parameters are not valid", async () => {
            let response = await request(app).post("/jobs")
                .send({
                    title: "UI Engineer",
                    salary: "55000",
                    equity: 0.4,
                    company_handle: "apple"
                });
            
            expect(response.statusCode).toEqual(400);
        }); 
    });

    /** PATCH /:id updates an existing job =>
     *      {job: jobData}
     */

     describe("PATCH /:id", function() {
         test("updates an existing job", async function() {
             //Get the correct id for the param
             let result = await db.query('SELECT id FROM jobs LIMIT 1')
             let id = result.rows[0].id

             let response = await request(app).patch(`/jobs/${id}`)
                .send({
                    title: "CS specialist",
                    salary: 50000
                });
            
            expect(response.body).toEqual({
                "job": {
                    "id": parseInt(`${id}`),
                    "title": "CS specialist",
                    "salary": 50000,
                    "equity": 0.5,
                    "company_handle": "apple",
                    "date_posted": expect.any(String)
                }
            });
         });

         test("400 if parameters passed are not valid", async function() {
             //Get the correct id for the param
             let result = await db.query('SELECT id FROM jobs LIMIT 1')
             let id = result.rows[0].id

             let response = await request(app).patch(`/jobs/${id}`)
                .send({
                    title: 400,
                    salary: "50000"
                });
            
            expect(response.statusCode).toEqual(400);
         });

         test("404 if job with id doesn't exist", async function(){
             let response = await request(app).patch(`/jobs/999999`)
                 .send({
                     title: "CS specialist",
                     salary: 50000
                 });

            expect(response.statusCode).toEqual(404)
         });
     });

     /** DELETE /:id remove a Job =>    
      *     {message: "Job deleted"}
      */

    describe("DELETE /: handle", function() {
        test("delete a job given its id", async function(){
            //Get the correct id for the param
            let result = await db.query('SELECT id FROM jobs LIMIT 1')
            let id = result.rows[0].id

            let response = await request(app).delete(`/jobs/${id}`);

            expect(response.body).toEqual({"message": "Job deleted"});
        });

        test("404 if no job with given id exists", async function() {
            let response = await request(app).delete("/jobs/999999999");

            expect(response.statusCode).toEqual(404);
        });
    });

});