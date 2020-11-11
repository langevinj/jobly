
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = require("../../app");
const db = require("../../db");

// global variable to store things for all tests
const TEST_DATA = {};

/*This hooks portion attributed to Springboard, not my own work */
/** Hooks to insert a user, company, and job and to auth
 * the user and the company for respective tokens that are stored in the input `testData` paramter.
 * @param {Object} TEST_DATA - build the TEST_DATA object
*/

async function beforeEachHook(TEST_DATA){
    try{
        //login a user, get a token, store the user ID and token
        const hashedPassword = await bcrypt.hash('secret', 1);
        await db.query(
            `INSERT INTO users (username, pwd, first_name, last_name, email, is_admin)
            VALUES ('testuser', $1, 'Test', 'Testy', 'test@test.com', true)`,
            [hashedPassword]
        );

        const response = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                pwd: 'secret'
            });

        TEST_DATA.userToken = response.body.token;
        TEST_DATA.currentUsername = jwt.decode(TEST_DATA.userToken).username;

        //do the same for company "companies"
        const result = await db.query(
            `INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            ["apple", "Apple", 4000, "Tech and computers", "www.apple.com"]
        );

        TEST_DATA.currentCompany = result.rows[0];

        //now for job
        const newJob = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            ['Customer Service', 40000, 0.5, TEST_DATA.currentCompany.handle]
        );

        TEST_DATA.jobId = newJob.rows[0].id;
        
        const newJobApp = await db.query(
            'INSERT INTO applications (username, job_id) VALUES ($1, $2) RETURNING *',
            [TEST_DATA.currentUsername, TEST_DATA.jobId]
        );

        TEST_DATA.jobApp = newJobApp.rows[0];

    } catch (error) {
        console.error(error);
    }
}

async function afterEachHook() {
    try{
        await db.query('DELETE FROM applications');
        await db.query('DELETE FROM jobs');
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM companies');
    } catch (error){
        console.error(error);
    }
}

async function afterAllHook(){
    try{
        await db.end();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    afterAllHook,
    afterEachHook,
    TEST_DATA,
    beforeEachHook
};