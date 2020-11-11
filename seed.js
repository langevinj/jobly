const Company = require("./models/company");
const Job = require("./models/job");
const User = require("./models/user")
const db = require("./db");
const { JsonWebTokenError } = require("jsonwebtoken");

async function seedDb(){
await db.query('DELETE FROM companies');
await db.query('DELETE FROM jobs');

await Company.create({
    handle: "apple",
    name: "Apple",
    num_employees: 4000,
    description: "Tech and computers",
    logo_url: "www.apple.com"
});

await Company.create({
    handle: "ibm",
    name: "IBM",
    num_employees: 1000,
    description: "IT services",
    logo_url: "www.ibm.com"
});

await Job.create({
    title: "Genius",
    salary: 70000.00,
    equity: 0.5,
    company_handle: "apple"
});

await User.register({
    username: "testuser",
    pwd: "abc123",
    first_name: "Test",
    last_name: "Testy",
    email: "testuser@test.com",
    is_admin: true
});

await db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Bootstrap']);
await db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['JavaScript']);
await db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Management']);
await db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Marketing experience']);
await db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Python']);

await db.query(`INSERT INTO jobs (title, salary, equity, requirements, company_handle)
            VALUES ('UX Engineer', 65000, 0.5, '1,2,3', 'apple')`);

await db.query(`INSERT INTO applications (username, job_id, state)
        VALUES ($1, $2, $3)`, ['testuser', 1, 'applied'])

}

seedDb();