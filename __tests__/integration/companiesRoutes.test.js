/** TESTing for companies.js routes 
 * run tests like:
 *          jest companiesRoutes.test.js
*/

//switch to test db
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/app.js");
const db = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/db.js");
const Company = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/models/company.js");

describe("Company Routes Test", function () {

    //clear out table and create sample data
    beforeEach(async function() {
        await db.query("DELETE FROM companies");

        let c1 = await Company.create({
            handle: "apple",
            name: "Apple",
            num_employees: 4000,
            description: "Tech and computers",
            logo_url: "www.apple.com"
        });
    });

    //add a second company when needed for testing
    async function addSecondCompany(){
        let c2 = await Company.create({
            handle: "ibm",
            name: "IBM",
            num_employees: 1000,
            description: "IT services",
            logo_url: "www.ibm.com"
        });
    }

    /** GET /companies => [{handle, name}, ...] */
    describe("GET /", function () {
        test("can get a list containing 1 company", async function () {
            let response = await request(app)
                .get("/companies")

            expect(response.body).toEqual({
                "companies": [{
                    "handle": "apple",
                    "name": "Apple"
                }]
            });
        });

        test("can get a filtered list of companies by a searched name", async function(){
            await addSecondCompany();
            let response = await request(app)
                .get("/companies?search=apple")
            
            expect(response.body).toEqual({
                "companies": [{
                    "handle": "apple",
                    "name": "Apple"
                }]
            });
        });

        test("can get a filter list of companies by min_employees", async function() {
            await addSecondCompany();
            let response = await request(app)
                .get("/companies?min_employees=2000")

            expect(response.body).toEqual({
                "companies": [{
                    "handle": "apple",
                    "name": "Apple"
                }]
            });
        });

        test("can get a filter list of companies by max_employees", async function () {
            await addSecondCompany();
            let response = await request(app)
                .get("/companies?max_employees=2000")

            expect(response.body).toEqual({
                "companies": [{
                    "handle": "ibm",
                    "name": "IBM"
                }]
            });
        });

        test("can filter companies by multiple parameters", async function() {
            await addSecondCompany();
            let response = await request(app)
                .get("/companies?search=apple&min_employees=1500&max_employees=9000")

            expect(response.body).toEqual({
                "companies": [{
                    "handle": "apple",
                    "name": "Apple"
                }]
            });
        });

        test("400 error if min_employees is higher than max_employees", async function(){
            let response = await request(app)
                .get("/companies?min_employees=6000&max_employees=5000")

            expect(response.statusCode).toEqual(400)
        });
    });

    /** GET /:handle =>  {company: {handle, name, num_employees, description, logo_url}}*/

    describe("GET /:handle", function (){
        test("gets a company given its handle", async function() {
            let response = await request(app)
                .get("/companies/apple")

            expect(response.body).toEqual({
                "company": {
                    "handle": "apple",
                    "name": "Apple",
                    "num_employees": 4000,
                    "description": "Tech and computers",
                    "logo_url": "www.apple.com"
                }
            });
        });

        test("404 if no company with the given handle", async function(){ 
            let response = await request(app)
                .get("/companies/ibm")

            expect(response.statusCode).toEqual(404)
        })
    });
    


});