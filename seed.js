const Company = require("./models/company");
const Job = require("./models/job");
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