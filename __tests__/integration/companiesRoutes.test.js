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

    /** GET /companies => [{company}, ...] */

    test("can get a list containing 1 book", async function(){
        let response = await request(app)
            .get("/companies")
        
        expect(response.body).toEqual({
            "companies": [{
                "handle": "apple",
                "name": "Apple",
                "num_employees": 4000,
                "description": "Tech and computers",
                "logo_url": "www.apple.com"
            }]
        });
    });


});