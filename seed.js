const Company = require("./models/company");
const Job = require("./models/job");
const User = require("./models/user")
const db = require("./db");
const { JsonWebTokenError } = require("jsonwebtoken");

db.query('DELETE FROM companies');
db.query('DELETE FROM jobs');

Company.create({
    handle: "apple",
    name: "Apple",
    num_employees: 4000,
    description: "Tech and computers",
    logo_url: "www.apple.com"
});

Company.create({
    handle: "ibm",
    name: "IBM",
    num_employees: 1000,
    description: "IT services",
    logo_url: "www.ibm.com"
});

Job.create({
    title: "Genius",
    salary: 70000.00,
    equity: 0.5,
    company_handle: "apple"
});

User.register({
    username: "testuser",
    pwd: "abc123",
    first_name: "Test",
    last_name: "Testy",
    email: "testuser@test.com",
    is_admin: true
});

db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Bootstrap']);
db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['JavaScript']);
db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Management']);
db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Marketing experience']);
db.query(`INSERT INTO technologies (tech_name) VALUES ($1)`, ['Python']);

db.query(`INSERT INTO jobs (title, salary, equity, requirements, company_handle)
            VALUES ('UX Engineer', 65000, 0.5, '1,2,3', 'apple')`);