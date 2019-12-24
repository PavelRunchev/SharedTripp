module.exports = {
    errorHandler: (err, req, res) => {
        res.flash('danger', 'Server Error 500!');
        console.log(err.message);
        console.log(err.stack);
        res.status(500).redirect('/user/login');
        return;
    }
}