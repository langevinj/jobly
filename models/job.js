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


    /** Retrieve a list of all jobs -- returns
   *    [{title, company_handle},...]
   */

    static async all(parameters = false) {

        //if no parameters are present, get ALL jobs
        if (parameters === false) {
            const result = await db.query(`SELECT title, company_handle FROM jobs`);
            return result.rows;
        } else {
            let columns = [];
            if ('search' in parameters) {
                columns.push(`title ILIKE '%${parameters['search']}%'`)
            }

            if ('min_salary' in parameters) {
                columns.push(`salary > ${parameters['min_salary']}`)
            }

            if ('min_equity' in parameters) {
                columns.push(`equity > ${parameters['min_equity']}`)
            }

            //construct query with parameters
            let cols = columns.join(' AND ');
            const result = await db.query(`SELECT title, company_handle FROM jobs
                        WHERE ${cols}`)
            return result.rows
        }
    }

}

module.exports = Job;