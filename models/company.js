
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const partialUpdate = require("../helpers/partialUpdate")

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
    if(!parameters){
        const result = await db.query(`SELECT handle, name FROM companies`);
        return result.rows;
    } else {
        let columns = [];
        if('search' in parameters){
            columns.push(`name ILIKE '%${parameters['search']}%'`)
        } 

        if('min_employees' in parameters){
            columns.push(`num_employees > ${parameters['min_employees']}`)
        }

        if('max_employees' in parameters){
            columns.push(`num_employees < ${parameters['max_employees']}`)
        }

        //throw error if min_exployees > max_employees
        if (parameters.min_employees && parameters.max_employees) {
            if (parseInt(parameters['min_employees']) > parseInt(parameters['max_employees'])) {
                throw new ExpressError("Incorrect parameters", 400)
            } 
        }

        //construct query with parameters
        let cols = columns.join(' AND ');
        const result = await db.query(`SELECT handle, name FROM companies
                        WHERE ${cols}`)
        return result.rows
    }
  }

  /** get a company by its handle, return
   *  {handle, name, num_employees, description, logo_url}
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

      if(!result.rows[0]){
        throw new ExpressError(`No such company with handle: ${handle}`, 404);
      }

      return result.rows[0];
  }

  /** update an existing company given its handle, return 
   * {handle, name, num_employees, description, logo_url}
   */
  static async update(handle, data){
      let response = sqlForPartialUpdate("companies", data, "handle", handle)
      const result = await db.query(response.query, response.values)

      if(!result.rows[0]){
          throw new ExpressError(`No such company with handle: ${handle}`, 404);
      }

      return result.rows[0]
  }

  
}












module.exports = Company;