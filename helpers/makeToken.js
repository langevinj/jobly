const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** returns a signed jwt token  */

function makeToken(user){
    const payload = { username: user.username, is_admin: user.is_admin };

    return jwt.sign(payload, SECRET_KEY);
}

module.exports = makeToken;