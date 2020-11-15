//Validate schemas for request bodies or throw a list of errors

const ExpressError = require("./expressError");
const jsonschema = require("jsonschema");

function validateSchema(req, schema) {
    const result = jsonschema.validate(req.body, schema)

    if(!result.valid) {
        const listOfErrors = result.errors.map(err => err.stack)

        const error = new ExpressError(listOfErrors, 400);
        throw error
    }
}

module.exports = validateSchema;