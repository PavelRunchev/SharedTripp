const controllers = require('../controllers');
const router = require('express').Router();
const auth = require('../config/auth');
const { body } = require('express-validator');

router.get('/shared-tripps', auth.isAuthed, controllers.tripp.sharedTripps);

router.get('/tripp-create', auth.isAuthed, controllers.tripp.trippCreateGet);
router.post('/tripp-create', auth.isAuthed, controllers.tripp.trippCreatePost);

router.get('/tripp-details/:id', auth.isAuthed, controllers.tripp.trippDetails);

router.get('/tripp-remove/:id', auth.isAuthed, controllers.tripp.trippRemove);

router.get('/tripp-join/:id', auth.isAuthed, controllers.tripp.trippJoin);

module.exports = router;