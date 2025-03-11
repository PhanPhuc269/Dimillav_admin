const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/Admin');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },async (email, password, done) => {
    console.log('LocalStrategy');
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return done(null, false);
        }
        done(null, { ...user.toObject(), isConfirmed: user.isConfirmed });
    } catch (error) {
        done(error);
    }
});

module.exports = passport;