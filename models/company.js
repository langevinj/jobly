//Model for the Company class

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const Job = require("./job");

class Company {

  /** create a new company --- returns
   *    {handle, name, num_employees, description, logo_url}
   */
  static async create({handle, name, num_employees, description, logo_url}) {
      const result = await db.query(
          `INSERT INTO companies (
              handle,
              name,
              num_employees,
              description,
              logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees, description, logo_url`,
        [handle, name, num_employees, description, logo_url]
      );
      return result.rows[0]
  }


  /** Retrieve a list of all companies -- returns
   *    [{handle, name},...]
   */

  static async all(parameters=false){
    
    //if no parameters are present, get ALL companies
    if(parameters === false){
        const result = await db.query(`SELECT handle, name FROM companies`);
        return result.rows;
    } else {
        const columns = [];
        if('search' in parameters){
            columns.push(`name ILIKE '%${parameters['search']}%'`)
        } 

        if('min_employees' in parameters){
            columns.push(`num_employees > ${parameters['min_employees']}`)
        }

        if('max_employees' in parameters){
            columns.push(`num_employees < ${parameters['max_employees']}`)
        }

        //return null to indicate error if min_exployees > max_employees
        if (parameters.min_employees && parameters.max_employees) {
            if (parseInt(parameters['min_employees']) > parseInt(parameters['max_employees'])) {
                return null;
            } 
        }

        //construct query with parameters
        const cols = columns.join(' AND ');
        const result = await db.query(`SELECT handle, name FROM companies
                        WHERE ${cols}`)
        return result.rows
    }
  }

  /** get a company by its handle, return
   *  {handle, name, num_employees, description, logo_url}
   * and list of jobs at that company jobs: [job, ...]
   */

  static async get(handle) {
      const result = await db.query(
          `SELECT handle,
                name, 
                num_employees,
                description,
                logo_url
            FROM companies
            WHERE handle = $1`, [handle]);
      
      //indicate error if no results are found
      if(!result.rows[0]){
        return null;
      }

      const company = result.rows[0]

      const allJobs = await Job.all()
      const arrayOfJobs = [];
      for(let i=0; i<allJobs.length; i++){
        if(allJobs[i].company_handle === handle){
            arrayOfJobs.push(allJobs[i])
        }
      }

      company["jobs"] = arrayOfJobs;

      return company
  }

  /** update an existing company given its handle, return 
   * {handle, name, num_employees, description, logo_url}
   */
  static async update(handle, data){
      if(data.token){
          delete data.token
      }
      const response = sqlForPartialUpdate("companies", data, "handle", handle)
      const result = await db.query(response.query, response.values)

      //indicate error if no company with this handle
      if(!result.rows[0]){
          return null;
      }

      return result.rows[0]
  }

  /** remove an existing company and return message: "Company deleted"
   */

  static async remove(handle){
    const result = await db.query(
        `DELETE FROM companies WHERE handle = $1
            RETURNING handle`, [handle]);
    //indicate company not found
    if(!result.rows[0]){
        return null
    }

    return "Company deleted"
  }
}


module.exports = Company;