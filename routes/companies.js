const express = require("express");
const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchema = require("../schema/companySchema");
const companyPartialSchema = require("../schema/companyPartialSchema");

const router = new express.Router();
/** GET / return the handle and name for all company objects
 * {companies: [{handle, name},...]}
 * allows for multiple optional query paraemters
 */

router.get("/", async function (req, res, next) {
    try{
        let parameters = req.query;
        let listOfCompanies;

        /**If optional parameters are present, pass them to the function*/
        if (parameters) {
            listOfCompanies = await Company.all(parameters);
        } else {
            listOfCompanies = await Company.all();
        }

        //if no companies are found that match, throw 404
        if(listOfCompanies.length === 0){
            throw new ExpressError("No companies found by this search", 404)
        }

        return res.json({ companies: listOfCompanies })  
    } catch (err) {
        return next(err)
    }
});

/** GET /[handle] get company by its handle return 
 *      {company: {handle, name, num_employees, description, logo_url}}
 */

router.get("/:handle", async function (req, res, next) {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company: company });
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