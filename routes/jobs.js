//Routes for jobs

const express = require("express");

const Job = require("../models/job");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

//require JSON schema
const jobSchema = require("../schema/jobSchema");
const jobPartialSchema = require("../schema/jobPartialSchema");

const router = new express.Router();


/** GET / return the title and company handle for all job objects
 *      {jobs: [{title, company_handle},...]}
 * allows for multiple optional query paraemters
 */

router.get("/", async function (req, res, next) {
    try {
        let listOfJobs;

        //check if any parameters are present
        if (Object.keys(req.query).length === 0) {
            listOfJobs = await Job.all()
        } else {
            listOfJobs = await Job.all(req.query);
        }

        return res.json({ jobs: listOfJobs})
    } catch (err) {
        return next(err)
  }
});

/** GET ./[id] get a job by its handle, return
 *      {job: jobData}
 * 
 */

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id)

        return res.json({ job: job })
    } catch (err) {
        return next(err)
    }
});


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
});


/** PATCH /[id]
 * update an existing job given its id, return
*         {job: jobData}
*/

router.patch("/:id", async function (req, res, next) {
    const result = jsonschema.validate(req.body, jobPartialSchema)

    if (!result.valid) {
        let listOfErrors = result.errors.map(err => err.stack)
        let error = new ExpressError(listOfErrors, 400);
        return next(error);
    }

    try {
        const job = await Job.update(req.params.id, req.body);

        return res.json({ job: job });
    } catch (err) {
        return next(err)
    }
});


/** DELETE /[id]  remove job from table and return
 *      {message: "Job deleted"}
*/

router.delete("/:id", async function (req, res, next) {
    try {
        const response = await Job.remove(req.params.id);

        return res.json({ message: response });
    } catch (err) {
        return next(err)
    }
});




module.exports = router;