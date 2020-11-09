//Routes for jobs

const express = require("express");

const Job = require("../models/job");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

const router = new express.Router();

// router.get("/", async function (req, res, next) {
//     try {

//     } catch (err) {
//         return next(err)
//     }
// })

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
    try{
        const job = await Job.create(req.body);
        return res.json({ job : job });
    } catch (err) {
        return next(err)
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