
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const cleanUpParams = require("../helpers/cleanUpParams")

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
        let paramsObject = cleanUpParams(parameters);
        let columns = [];
        if('search' in paramsObject){
            columns.push(`name ILIKE '%${paramsObject['search']}%'`)
        } 

        if('min_employees' in paramsObject){
            columns.push(`num_employees > ${paramsObject['min_employees']}`)
        }

        if('max_employees' in paramsObject){
            columns.push(`num_employees < ${paramsObject['max_employees']}`)
        }

        //throw error if min_exployees > max_employees
        if (paramsObject.min_employees && paramsObject.max_employees) {
            if (parseInt(paramsObject['min_employees']) > parseInt(paramsObject['max_employees'])) {
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

  
}

module.exports = Company;