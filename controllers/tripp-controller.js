const Tripp = require('../models/Tripp');
const User = require('mongoose').model('User');
const { errorHandler } = require('../config/errorHandler');

module.exports = {
    sharedTripps: (req, res) => {
        Tripp.find({}).select('startPoint endPoint carImage').then((tripps) => {
            const isTripps = tripps.length > 0 ? true : false;
            res.render('tripp/noSharedTripps', { tripps, isTripps });
        }).catch(err => errorHandler(err, req, res));
    },

    trippCreateGet: (req,  res) => {
        const tripp = req.body;
        res.render('tripp/tripp-create', tripp);
    },

    trippCreatePost: (req, res) => {
        const driverId = res.locals.currentUser._id;
        let { startAndEndPoint, dateTime, carImage, seats, description } = req.body;

        if(!startAndEndPoint.includes(' - ')) {
            res.locals.globalError = "Invalid Start and End Point, miissing single space, dash and another single space";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        const startPoint = startAndEndPoint.split(' - ')[0];
        const endPoint = startAndEndPoint.split(' - ')[1];
        if(startPoint.length < 4) {
            res.locals.globalError = "Start point should be at least 4 characters long";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        if(endPoint.length < 4) {
            res.locals.globalError = "End point should be at least 4 characters long";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        //todo date time
        if(!dateTime.includes(' - ')) {
            res.locals.globalError = "Date and Time should be separated with single space, dash and another single space!";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        const date = dateTime.split(' - ')[0];
        const time =  dateTime.split(' - ')[1];
        if(date.length < 4) {
            res.locals.globalError = "Date should be at least 4 characters long";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        if(time.length < 4) {
            res.locals.globalError = "Time should be at least 4 characters long!";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        if(!carImage.startsWith('http') || !carImage.startsWith('https')) {
            res.locals.globalError = "Car image should be not actual ling!";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        if(Number(seats) < 1) {
            res.locals.globalError = "Seats should be positive number!";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        if(description.length < 10) {
            res.locals.globalError = "Description should be minimum 10 characters long!";
            const tripp = req.body;
            res.render('tripp/tripp-create', tripp);
            return;
        }

        Promise.all([
            Tripp.create({
                startPoint,
                endPoint,
                date,
                time,
                seats: Number(seats),
                description,
                carImage,
                buddies: driverId
            }),

            User.findById(driverId)
        ]).then(([newTripp, user]) => {
            user.trippsHistory.push(newTripp._id);
            return Promise.resolve(user.save());
        }).then(() => {
            res.flash('success', 'Tripp created successfully!');
            res.status(301).redirect('/tripp/shared-tripps');
        }).catch(err => errorHandler(err, req, res));

    },

    trippDetails: (req,  res) => {
        if(res.locals.currentUser !== undefined) {
            const trippId = req.params.id;
            const userId = res.locals.currentUser._id;
            Promise.all([
                Tripp.findById(trippId).populate('buddies', 'email'),
                User.find({}).select('trippsHistory email'),
                User.findById(userId)
            ]).then(([tripp, users, loggedUser]) => {
                const userBuddies = users
                    .filter(u => u.trippsHistory.includes(tripp._id))
                    .filter(u => u._id.toString() !== tripp.buddies._id.toString())
                    .map(u => u = u.email)
                    .join(', ');
                
                let isBuddies = false;
                let isDriverToTripp = false;
                let isAlreadyJoined = false;
                let noSetAvailable = false;
                if(userBuddies.length > 0) {
                    isBuddies = true;
                }
    
                if(tripp.buddies._id.toString() === userId.toString()) {
                    isDriverToTripp = true;
                }
    
                if(Number(tripp.seats) === 0) {
                    noSetAvailable = true;
                }
    
                res.locals.currentUser = loggedUser;
                if(loggedUser.trippsHistory.includes(trippId)) {
                    isAlreadyJoined = true;
                }
                res.render('tripp/tripp-details', 
                { tripp, isDriverToTripp, isAlreadyJoined, noSetAvailable, isBuddies, userBuddies });
            }).catch(err => errorHandler(err, req, res));
        } else {
            res.flash('danger', 'Invalid credentials! Unauthorized!');
            res.status(401).redirect('/user/login');
            return;
        }
    },

    trippRemove: (req, res) => {
        const trippId = req.params.id;
        Tripp
            .findByIdAndRemove({ _id: trippId })
            .then((tripp) => {
                return Promise.all([tripp, User.findById(tripp.buddies)]);
            }).then(([tripp, user]) => {
                user.trippsHistory.pull(tripp._id);
                return Promise.resolve(user.save());
            }).then(() => {
                res.flash('success', 'Tripp removed successfully!');
                res.status(301).redirect('/tripp/shared-tripps');
            }).catch(err => errorHandler(err, req, res));
    },

    trippJoin: (req, res) => {
        const trippId = req.params.id;
        const userId = res.locals.currentUser._id;
        if(userId) {
            Promise.all([
                Tripp.findById(trippId),
                User.findById(userId)
            ]).then(([ tripp, user]) => {
                    user.trippsHistory.push(tripp._id);
                    tripp.seats = Number(tripp.seats) - 1;
                    return Promise.all([ user.save(), tripp.save()]);
            }).then(([user, tripp]) => {
                res.flash('success', 'You joined successfully!');
                res.status(301).redirect(`/tripp/tripp-details/${tripp._id}`);
            }).catch(err => errorHandler(err, req, res));
        } else {
            res.flash('danger', 'Invalid credentials! Unauthorized!');
            res.status(401).redirect('/user/login');
            return;
        }
    }
}