//helper function for adding an array of requirements to the DB
const db = require("../db");
const Technologies = require("../models/technologies");

//add each requirement to the table, return an array of their ids
async function createRequirements(requirements){
    const requirementIds = [];
    const requirementNames = [];
    for(let i=0; i<requirements.length; i++){
        let result = await Technologies.create(requirements[i]);
        requirementIds.push(result.id);
        requirementNames.push(requirements[i]);
    }
    return {"requirementIds": requirementIds, "requirementNames": requirementNames};
}

module.exports = createRequirements;