const Company = require("./models/company")
const db = require("./db")

db.query('DELETE FROM companies');

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