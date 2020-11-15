//Routes for jobs

const express = require("express");

const Job = require("../models/job");

//require JSON schema
const jobSchema = require("../schema/jobSchema");
const jobPartialSchema = require("../schema/jobPartialSchema");
const ExpressError = require("../helpers/expressError");
const applicationStateSchema = require("../schema/applicationStateSchema");

const { authenticateJWT, ensureAdmin, ensureCorrectUser } = require("../middleware/auth");
const validateSchema = require("../helpers/validateSchema");

const router = new express.Router();


/** GET / return the title and company handle for all job objects
 *      {jobs: [{title, company_handle},...]}
 * allows for multiple optional query paraemters
 */

router.get("/", authenticateJWT, async function (req, res, next) {
    try {
        let listOfJobs;
        //check if any parameters are present
        if (Object.keys(req.query).length === 0) {
            listOfJobs = await Job.all();
        } else {
            listOfJobs = await Job.all(req.query);
        }
        return res.json({ jobs: listOfJobs});
    } catch (err) {
        return next(err);
  }
});

/** GET ./[id] get a job by its handle, return
 *      {job: jobData}
 * 
 */

router.get("/:id", authenticateJWT, async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        if(!job){
            throw new ExpressError(`No such job with id: ${req.params.id}`, 404); 
        }
        return res.json({ job: job });
    } catch (err) {
        return next(err);
    }
});


/** POST / create a new job and return the job
 *      {job: jobData}
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try{
        validateSchema(req, jobSchema);
        const job = await Job.create(req.body);
        return res.json({ job : job });
    } catch (err) {
        return next(err);
    }
});

/** POST /:id/apply takes state of application and returns
 *      {mesage: new-state}
*/

router.post("/:id/apply", ensureCorrectUser, async function(req, res, next) {
    try{
        validateSchema(req, applicationStateSchema);
        const currentState = await Job.apply(req.params.id, req.body);
        return res.json({message: currentState});
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[id]
 * update an existing job given its id, return
*         {job: jobData}
*/

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        validateSchema(req, jobPartialSchema);
        const job = await Job.update(req.params.id, req.body);
        if(!job){
            throw new ExpressError(`No such job with id: ${req.params.id}`, 404);
        }
        return res.json({ job: job });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /[id]  remove job from table and return
 *      {message: "Job deleted"}
*/

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const response = await Job.remove(req.params.id);
        if(!response){
            throw new ExpressError(`No such job with id: ${req.params.id}`, 404); 
        }
        return res.json({ message: response });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;