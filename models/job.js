//Model for the Job class

const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Job {

    /** create a new job      returns
     *      {title, salary, equity, company_handle, date_posted}
     */
    static async create({title, salary, equity, company_handle}) {
        const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle, date_posted`,
            [title, salary, equity, company_handle]);
        return result.rows[0]
    }
}

module.exports = Job;