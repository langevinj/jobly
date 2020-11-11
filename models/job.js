//Model for the Job class

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

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

    /** get a job by its handle, return
   *  {title, salary, equity, company: {handle, name, num_employees, description, logo_url}, date_posted}}
   */

    static async get(id) {
        const result = await db.query(
            `SELECT title,
                salary, 
                equity,
                date_posted,
                handle,
                name,
                num_employees,
                description,
                logo_url
            FROM jobs
            JOIN companies ON jobs.company_handle = companies.handle
            WHERE id = $1`, [id]);

        if (!result.rows[0]) {
            throw new ExpressError(`No such job with id: ${id}`, 404);
        }

        let data = result.rows[0]

        //Check if the job has listed requirements, and get the array of them if it does
        const requirements = await db.query(
            `SELECT requirements FROM jobs WHERE id = $1`, [id]
        );
        
        //if there are requiremnets listed, grab each of them from the technologies table
        let requirementNames = [];
        if(requirements.rows.length !== 0){
            let requirementsArray = requirements.rows[0].requirements.split(',');
            for(let i=0; i<requirementsArray.length; i++){
                let tempRequirement = await db.query(
                       `SELECT tech_name FROM technologies
                       WHERE tech_id = $1`, [parseInt(requirementsArray[i])] 
                    );
                requirementNames.push(tempRequirement.rows[0].tech_name);
            }
        }

        return {
            "title": data.title,
            "salary": data.salary,
            "equity": data.equity,
            "company": {
                "handle": data.handle,
                "name": data.name,
                "num_employees": data.num_employees,
                "description": data.description,
                "logo_url": data.logo_url
            },
            "requirements": requirementNames,
            "date_posted": data.date_posted
        }
    }


    /** update an existing job given its id, return 
    *    {title, salary, equity, company_handle, date_posted}
    */

    static async update(id, data) {
        if(data.token){
            delete data.token
        }
        let response = sqlForPartialUpdate("jobs", data, "id", id)
        const result = await db.query(response.query, response.values)

        if (!result.rows[0]) {
            throw new ExpressError(`No such job with id: ${id}`, 404);
        }

        return result.rows[0]
    }

    /** remove an existing job return "Job deleted" */

    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs WHERE id = $1
            RETURNING id`, [id]);

        if (!result.rows[0]) {
            throw new ExpressError(`No such job with id: ${id}`, 404);
        }

        return "Job deleted"
    }


    /**Insert a new state into the applications table and return the new-state */
    static async apply(id, data){
        let info = jwt.decode(data.token);

        const result = await db.query(
            `INSERT INTO applications (username, job_id, state)
            VALUES($1, $2, $3) RETURNING state`, [info.username, id, data.state]
        );

        return result.rows[0]
    }


}

module.exports = Job;