const jwt = require('../util/jwt');
const { decryptCookie } = require('../util/encryptCookie');

module.exports = {
    isAuthed: async (req, res, next) => {
        const token = req.cookies['auth_cookie'] || '';
        if(token) {
            const data = await jwt.verifyToken(token);
            if (data) { 
                next();
            } else {
                res.flash('danger', 'Invalid credentials! Unauthorized!');
                res.status(401).redirect('/user/login');
                return;
            }
        } else {
            res.flash('danger', 'Invalid credentials! Unauthorized!');
            res.status(401).redirect('/user/login');
            return;
        }
    },

    isGuest: (req, res, next) => {
        const token = req.cookies['auth_cookie'] || '';
        if(token) {
            res.flash('danger', 'You are already log in!');
            res.status(401).redirect('/');
            return;
        } else {
            next();
        }
    }
};