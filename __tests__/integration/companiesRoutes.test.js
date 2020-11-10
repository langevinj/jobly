/** Testing for companies.js routes 
 * run tests like:
 *          jest companiesRoutes.test.js
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


beforeEach(async function() {
    await beforeEachHook(TEST_DATA);
});

// remove console.error from tests designed to fail, can be commented out as needed
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
})

describe("GET /companies", function () {
    test("can get a list containing 1 company", async function () {
        const response = await request(app).get('/companies')
            .send({
                token: TEST_DATA.userToken
            });
        console.log(response.body.companies)
        expect(response.body.companies).toHaveLength(1);
        expect(response.body.companies[0]).toHaveProperty('handle');
    });

    test("can get a filtered list of companies by a searched name", async function(){
        let response = await request(app)
            .get("/companies?search=apple")
            .send({
                token: TEST_DATA.userToken
            });
            
        expect(response.body).toEqual({
            "companies": [{
                "handle": "apple",
                "name": "Apple"
            }]
        });
    });

        test("can get a filter list of companies by min_employees", async function() {
            let response = await request(app)
                .get("/companies?min_employees=2000")
                .send({
                    token: TEST_DATA.userToken
                });

            expect(response.body).toEqual({
                "companies": [{
                    "handle": "apple",
                    "name": "Apple"
                }]
            });
        });

        test("can get a filter list of companies by max_employees", async function () {
            let response = await request(app)
                .get("/companies?max_employees=7000")
                .send({
                    token: TEST_DATA.userToken
                });

            expect(response.body.companies).toHaveLength(1);
            expect(response.body.companies[0].handle).toEqual("apple");
        });

        test("can filter companies by multiple parameters", async function() {
            let response = await request(app)
                .get("/companies?search=apple&min_employees=1500&max_employees=9000")
                .send({
                    token: TEST_DATA.userToken
                });

                expect(response.body.companies).toHaveLength(1);
                expect(response.body.companies[0].name).toEqual("Apple");
        });

        test("400 error if min_employees is higher than max_employees", async function(){
            let response = await request(app)
                .get("/companies?min_employees=6000&max_employees=5000")
                .send({
                    token: TEST_DATA.userToken
                });

            expect(response.statusCode).toEqual(400)
        });
});


describe("GET /:handle", function (){
    test("gets a company given its handle", async function() {
        let response = await request(app)
            .get("/companies/apple")
            .send({
                token: TEST_DATA.userToken
            });
        expect(response.body.company).toHaveProperty('handle');
        expect(response.body.company.handle).toBe('apple');
    });

    test("404 if no company with the given handle", async function(){ 
        let response = await request(app)
            .get("/companies/ibm")
            .send({
                token: TEST_DATA.userToken
            });

        expect(response.statusCode).toEqual(404)
    });
});

    /** POST / creates a new company => {company: {handle, name, num_employees, description, logo_url}}
    */

describe("POST /companies", function(){
    test("creates a new company given valid parameters", async function(){
        let response = await request(app)
            .post("/companies")
            .send({
                handle: "ibm",
                name: "IBM",
                num_employees: 1000,
                description: "IT services",
                logo_url: "https://www.ibm.com",
                token: TEST_DATA.userToken
            })
        
        expect(response.body).toEqual({
            "company":{
                "handle": "ibm",
                "name": "IBM",
                "num_employees": 1000,
                "description": "IT services",
                "logo_url": "https://www.ibm.com"}
        })
    });
    test("400 if parameters are not valid", async () => {
        let response = await request(app).post("/companies")
            .send({
                handle: "ibm",
                name: "IBM",
                num_employees: 1000,
                description: "IT services",
                logo_url: "asdfghjkl",
                token: TEST_DATA.userToken
            });
        
        expect(response.statusCode).toEqual(400)
    });
});


describe("PATCH /companies/:handle", function () {
    test("updates an existing company", async function(){
        let response = await request(app).patch("/companies/apple")
            .send({
                name: "Macintosh",
                num_employees: 10000,
                token: TEST_DATA.userToken
            });
        expect(response.body).toEqual({
            "company": {
                "handle": "apple",
                "name": "Macintosh",
                "num_employees": 10000,
                "description": "Tech and computers",
                "logo_url": "www.apple.com"
            }
        });
    });
    test("400 if parameters passed are not valid", async function(){
        let response = await request(app).patch("/companies/apple")
            .send({
                num_employees: "10000",
                language: "english",
                token: TEST_DATA.userToken
            });
        expect(response.statusCode).toEqual(400)
    });
    test("404 if no company with given handle", async function () {
        response = await request(app).patch("/companies/asdfghjkl")
            .send({
                name: "Macintosh",
                num_employees: 10000,
                token: TEST_DATA.userToken
            });
        expect(response.statusCode).toEqual(404)
    }); 
});


describe("DELETE /companies/:handle", function() {
    test("delete a company given a handle", async function(){
        let response = await request(app).delete("/companies/apple").send({token: TEST_DATA.userToken})
        expect(response.body).toEqual({
            "message": "Company deleted",
        });
    });
    test("404 if no company with given handle", async function() {
        let response = await request(app).delete("/companies/ibm").send({ token: TEST_DATA.userToken })
        expect(response.statusCode).toEqual(404)
    }); 
});


afterEach(async function() {
    await afterEachHook();
});

afterAll(async function() {
    await afterAllHook();
});