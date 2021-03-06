//Model for the Job class

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

const jwt = require("jsonwebtoken");
const listRequirements = require("../helpers/listRequirements");

class Job {

    /** create a new job      returns
     *      {title, salary, equity, company_handle, date_posted}
     */
    static async create({title, salary, equity, company_handle, requirements=[]}) {
        const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle, date_posted`,
            [title, salary, equity, company_handle]);
        
        // if(requirements !== ""){
        //     const arrayOfRequirements = await listRequirements(result.rows[0].id);
        //     result.rows[0].requirements = arrayOfRequirements;
        // }
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
            const columns = [];
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
            const cols = columns.join(' AND ');
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
        
        //indicate no job with this id found
        if (!result.rows[0]) {
            return null
        }

        const data = result.rows[0]
        // const arrayOfRequirements = await listRequirements(id);

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
        const response = sqlForPartialUpdate("jobs", data, "id", id)
        const result = await db.query(response.query, response.values)

        //indicate no job with this id found
        if (!result.rows[0]) {
            return null
        }

        return result.rows[0]
    }

    /** remove an existing job return "Job deleted" */

    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs WHERE id = $1
            RETURNING id`, [id]);
        
        //indicate no job with this id found
        if (!result.rows[0]) {
            return null
        }

        return "Job deleted"
    }


    /**Insert a new state into the applications table and return the new-state */
    static async apply(id, data){
        const info = jwt.decode(data.token);

        const result = await db.query(
            `INSERT INTO applications (username, job_id, state)
            VALUES($1, $2, $3) RETURNING state`, [info.username, id, data.state]
        );

        return result.rows[0]
    }

    static async linkTechnologies(job_id, requirementIds){
        for(let i=0; i<requirementIds.length; i++){
            console.log(requirementIds[i])
            await db.query(
                `INSERT INTO jobs_technologies (tech_id, job_id)
                VALUES ($1, $2)`, [requirementIds[i], job_id]
            );
        }

        const result = await db.query(
            `SELECT jobs.id AS id,
                    title,
                    salary,
                    equity,
                    company_handle,
                    date_posted,
                    array_agg(tech_name) as requirements
            FROM jobs_technologies
            LEFT JOIN jobs ON jobs_technologies.job_id = jobs.id
            LEFT JOIN technologies ON jobs_technologies.tech_id = technologies.id
            GROUP BY jobs.id`
        )

        return result.rows[0]
    }
}

module.exports = Job;