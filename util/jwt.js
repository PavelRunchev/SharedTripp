var jwt = require('jsonwebtoken');
const secret = 'ResidentEvil2REMAKEfromCAPCOM';

function createToken(data) {
    return jwt.sign(data, secret, { expiresIn: '1d' });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, data) => {
            if (err) { 
                console.log(err.message);
            }

            resolve(data);
        });
    });
}

module.exports = {
    createToken,
    verifyToken
};