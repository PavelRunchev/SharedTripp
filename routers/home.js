const controllers = require('../controllers');
const router = require('express').Router();
const auth = require('../config/auth');

router.get('/', controllers.home.index);

module.exports = router;