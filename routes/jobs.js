//Routes for jobs

const express = require("express");

const Job = require("../models/job");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

//require JSON schema
const jobSchema = require("../schema/jobSchema");
const jobPartialSchema = require("../schema/jobPartialSchema");

const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {

    } catch (err) {
        return next(err)
    }
})

// router.get("/:id", async function (req, res, next) {
//     try {

//     } catch (err) {
//         return next(err)
//     }
// })

/** POST / create a new job and return the job
 *      {job: jobData}
 */

router.post("/", async function (req, res, next) {
    const result = jsonschema.validate(req.body, jobSchema)

    if(!result.valid) {
        let listOfErrors = result.errors.map(err => err.stack)
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
    }

    try{
        const job = await Job.create(req.body);
        return res.json({ job : job });
    } catch (err) {
        return next(err);
    }
})

// router.patch("/:id", async function (req, res, next) {
//     try {

//     } catch (err) {
//         return next(err)
//     }
// })

// router.delete("/:id", async function (req, res, next) {
//     try {

//     } catch (err) {
//         return next(err)
//     }
// })




module.exports = router;