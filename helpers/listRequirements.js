//**Return an array of requirements by name given a jobs id */
const db = require("../db");

async function listRequirements(job_id){
    const requirements = await db.query(
        `SELECT requirements FROM jobs WHERE id = $1`, [job_id]
    );

    //if there are requiremnets listed, grab each of them from the technologies table
    let requirementNames = [];
    if (requirements.rows[0].requirements !== null) {
        let requirementsArray = requirements.rows[0].requirements.split(',');
        for (let i = 0; i < requirementsArray.length; i++) {
            let tempRequirement = await db.query(
                `SELECT tech_name FROM technologies
                       WHERE tech_id = $1`, [parseInt(requirementsArray[i])]
            );
            requirementNames.push(tempRequirement.rows[0].tech_name);
        }
    }
    if(requirementNames === []){
        return "No requirements listed"
    } else {
        return requirementNames;
    }

}

module.exports = listRequirements;