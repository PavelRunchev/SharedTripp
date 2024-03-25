const express = require('express');
const path = require('path');

const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash-2');
const { decryptCookie } = require('../util/encryptCookie');
const { authCookieName } = require('../util/app-config');

module.exports = app => {
    app.engine('.hbs', handlebars({
        defaultLayout: 'main',
        extname: '.hbs'
    }));

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(express.static('./static'));
    app.use(session({
        secret: 'raiders',
        saveUninitialized: true,
        resave: true   
    }));
    app.use(flash());

    app.use(function(req, res, next) {
        // flash configuretion to express!
        // delete flash in session when is empty!!!
        if (Object.getOwnPropertyNames(res.locals.flash).length === 0) {
            delete req.session.flash;
            delete res.locals.flash;
        }

        next();
    });

   
    app.use(function(req, res, next) {
        // checking for valid token
        if(req.cookies[authCookieName] === req.session.auth_cookie) {
            res.locals.currentUser = req.session.user;
            const u_id = decryptCookie(req.cookies['_u_i%d%_']);
            // checking for valid user id
            if(u_id && res.locals.currentUser._id) {
                res.locals.isAuthed = req.cookies[authCookieName] === req.session.auth_cookie;
            }
        }

        next();
    });

    app.set('view engine', '.hbs');
};