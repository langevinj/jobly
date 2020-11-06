/** Clean up and array of query string paramters and return
 * and object where the key is the query term
 * and the value is the value of the query parameter
 */

function cleanUpParams(arrayOfParameters){
    let paramsObject = {};
    for(let i=0; i<arrayOfParameters.length; i++){
        let tempArr = arrayOfParameters[i].split("=")
        paramsObject[tempArr[0]] = tempArr[1]
    }
    return paramsObject;
}

module.exports = cleanUpParams;