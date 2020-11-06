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

        return res.json({ companies: listOfCompanies })  
    } catch (err) {
        return next(err)
    }
});













module.exports = router;