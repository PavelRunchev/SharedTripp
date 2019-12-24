const { errorHandler } = require('../config/errorHandler');

module.exports = {
    index: (req, res) => {
        res.status(200).render('home/index');
    }, 

    pageNotFound: (req, res) => {
        res.status(200).render('error/pageNotFound');
    }
}