//Routes for companies

const express = require("express");

const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

const companySchema = require("../schema/companySchema");
const companyPartialSchema = require("../schema/companyPartialSchema");

const { SECRET_KEY } = require("../config");
const { authenticateJWT } = require("../middleware/auth");

const router = new express.Router();
/** GET / return the handle and name for all company objects
 * {companies: [{handle, name},...]}
 * allows for multiple optional query paraemters
 */

router.get('/', authenticateJWT, async function (req, res, next) {
    try{
        let listOfCompanies;

        //check if any parameters are present
        if(Object.keys(req.query).length === 0){
            listOfCompanies = await Company.all()
        } else {
            listOfCompanies = await Company.all(req.query);
        }

        return res.json({ companies: listOfCompanies })  
    } catch (err) {

        return next(err)
    }
});

/** GET /[handle] get company by its handle return 
 *      {company: {handle, name, num_employees, description, logo_url, jobs: [job, ...]}}
 */

router.get("/:handle", authenticateJWT, async function (req, res, next) {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});


/** POST / create a new company and return ---
 *      {company: {handle, name, num_employees, description, logo_url}}
 */

router.post("/", async function (req, res, next) {
    const result = jsonschema.validate(req.body, companySchema)

    if(!result.valid){
        let listOfErrors = result.errors.map(err => err.stack)
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
    }

    const company = await Company.create(req.body);
    return res.json({ company: company });
});

/**  PATCH /[handle] update an existing company and return
 *       {company: {handle, name, num_employees, description, logo_url}}
*/

router.patch("/:handle", async function (req, res, next) {
    const result = jsonschema.validate(req.body, companyPartialSchema)

    if (!result.valid) {
        let listOfErrors = result.errors.map(err => err.stack)
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
    }

    try{
        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company: company });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[handle]  remove company from table and return
 *      {message: "Company deleted"}
*/

router.delete("/:handle", async function (req, res, next) {
    try {
        const response = await Company.remove(req.params.handle);
        return res.json({message: response});
    } catch (err) {
        return next(err);
    } 
});






module.exports = router;