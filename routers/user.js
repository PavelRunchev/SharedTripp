const controllers = require('../controllers');
const router = require('express').Router();
const auth = require('../config/auth');
const { body } = require('express-validator');
const User = require('../models/User');

    //
    // User Router
    //
    router.get('/register', auth.isGuest, controllers.user.registerGet);

    router.post('/register', [
        body('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email is required!')
        .matches('^[A-Za-z0-9._-]+@[a-z0-9.-]+.[a-z]{2,4}$').withMessage('Email is incorrect format!')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
                if (userDoc)
                    return Promise.reject('E-Mail address already exists!');
            });
        }),
        body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is required!')
        .isLength({ min: 6 })
        .withMessage('The password should be at least 6 characters long!'),
    ], auth.isGuest, controllers.user.registerPost);

    router.get('/login', auth.isGuest, controllers.user.loginGet);
    router.post('/login', auth.isGuest, controllers.user.loginPost);

    router.get('/logout', auth.isAuthed, controllers.user.logout);

    module.exports = router;