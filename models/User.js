const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const userSchema = new mongoose.Schema({
    email: { type: mongoose.Schema.Types.String, required: true, unique: true },
    passwordHash: { type: mongoose.Schema.Types.String, required: true },
    trippsHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tripp', default: [] }],
    salt: { type: mongoose.Schema.Types.String, required: true },
    roles: [{ type: mongoose.Schema.Types.String }],
});

userSchema.method({
    matchPassword: function(password) {
        return bcrypt.compare(password, this.passwordHash);
    }
});

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) { next(err); return; }
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (err) { next(err); return; }
          this.password = hash;
          next();
        });
      });
      return;
    }
    next();
  });

const User = mongoose.model('User', userSchema);

User.seedAdminUser = async() => {
    try {
        let users = await User.find();
        if (users.length > 0) return;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) { next(err); return; }
            bcrypt.hash('123456', salt, (err, hash) => {
                if(err) { next(err); return; }
                return User.create({
                    email: 'abobo@abv.bg',
                    salt,
                    passwordHash: hash,
                    trippsHistory: [],
                    roles: ['User']
                });
            });
        });
    } catch (next) {
        next();
    }
};

module.exports = User;