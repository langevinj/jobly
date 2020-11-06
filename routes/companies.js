const Router = require("express").Router;
const router = new Router();

const Company = require("../models/company");
const ExpressError = require("../helpers/expressError");

/** GET / return the handle and name for all company objects
 * {companies: [{handle, name},...]}
 * allows for multiple optional query paraemters
 */

router.get("/:parameters?", async function (req, res, next) {
    try{
        const parameters = req.params.parameters;
        let listOfCompanies;

        /**If optional parameters are present, pass them to the function*/
        if (parameters) {
            const listOfParameters = parameters.split("&");
            listOfCompanies = await Company.all(listOfParameters);
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


/** POST / create a new company and return ---
 *      {company: {handle, name, num_employees, description, logo_url}}
 */

router.post("/", async function (req, res, next) {
    try{
        const company = await Company.create(req.body)
        return res.json({ company: company })
    } catch (err) {
        return next(err)
    }
})












module.exports = router;