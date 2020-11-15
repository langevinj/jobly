//Model for technologies

const db = require("../db");

class Technologies {

    /** create a new technology -- returns
     *      {id, tech_name}
     */
    static async create(tech_name) {
        const result = await db.query(
            `INSERT INTO technologies (tech_name)
            VALUES ($1)
            RETURNING id`, [tech_name]
        );
        return result.rows[0]
    }
}

module.exports = Technologies;