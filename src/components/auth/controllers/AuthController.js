
const { mutipleMongooseToObject ,mongooseToObject } = require('@utils/mongoose');
const crypto = require('crypto');
const passport = require('passport');
const UserService = require('../services/UserService');

class AuthController{
    viewRegistration(req,res,next){
        res.render('registration',  { layout: 'content-only' });
    }
    async register(req, res, next) {
        const { username, email, password } = req.body;
        try {
            const user = await UserService.registerUser(username, email, password);

            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                UserService.sendConfirmationEmail(user);
                return res.status(201).json('Login is successful'); // Redirect về trang chủ sau khi xác thực
            });
        } catch (error) {
            if (error.message === 'Username already exists' || error.message === 'Email already exists'|| error.message === 'Invalid email format') {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    }
    async setAuthentication(req, res, next) {
        try {
            const userId = req.user._id;
            const qrCode = await UserService.generateSecretKey(userId);
            if (qrCode === null) {
                return res.redirect('/');
            }
            return res.render('secretqr', { layout: 'content-only', qrCode });
        } catch (error) {
            console.error('Error in setAuthentication:', error);
            next(error);
        }
    }
    // [GET] /confirm/:token
    async confirmAccount(req, res, next) {
        try {
            const user = await UserService.confirmAccount(req.params.token);
            res.redirect('/');
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // [GET] /forgot-password
    viewForgotPassword(req, res, next) {
        res.render('forgot-password');
    }

    // [POST] /forgot-password
    async forgotPassword(req, res, next) {
        const { email } = req.body;
        try {
            const user = await UserService.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await UserService.sendVerificationCode(req, user);
            res.json({ message: 'Verification code sent to your email' });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /verify-code
    async verifyCode(req, res, next) {
        const { email, verificationCode } = req.body;
        try {
            const token = await UserService.verifyCode(req, email, verificationCode);
            res.json({ token });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // [GET] /reset-password/:token
    viewResetPassword(req, res, next) {
        res.render('reset-password', { token: req.params.token });
    }

    // [POST] /reset-password/:token
    async resetPassword(req, res, next) {
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        try {
            const user = await UserService.resetPassword(req.params.token, password);
            res.redirect('/login');
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // [GET] /verify
    async waitingForConfirmation(req, res, next) {
        const user = mongooseToObject(await UserService.findUserByUserId(req.user._id));
        UserService.sendConfirmationEmail(user);
        res.render('waiting-confirmation', {
            username: user.username,
            email: user.email,
            message: 'A new confirmation email has been sent.',
        })
    }
    // [GET] /check-confirmation
    async checkConfirmation (req, res,next) {
        const user = await UserService.findUserByUserId(req.user._id);
        if (user && user.isConfirmed) {
             res.json({ isConfirmed: true });
        } else {
             res.json({ isConfirmed: false });
        }
    }
    // [POST] /resend-confirmation
    async reSendConfirmation(req, res, next) {
        const user = await UserService.findUserByUserId(req.user._id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.isConfirmed) {
            return res.redirect('/');
        }

        // Gửi lại email xác nhận
        await UserService.sendConfirmationEmail(user);

        res.render('notify', { layout: 'content-only', email: user.email });
    }
    // [GET] /login
    viewLogin(req, res, next) {
        if(req.isAuthenticated()){
            return res.redirect('/');
        }
        const email = req.flash('email')[0] || '';
        res.render('login', { layout: 'content-only', email });
    }
    // [POST] /login
    async login(req, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('error_msg', 'Sai email hoặc mật khẩu');
                req.flash('email', req.body.email);
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                if (!user.isConfirmed) {
                    UserService.sendConfirmationEmail(user);
                    return res.status(401).json({ message: 'Unauthorized: Invalid token or authentication failed. Please check your email' });
                }
                return res.status(200).json('Login is successful'); // Redirect về trang chủ sau khi xác thực
            });
        })(req, res, next);
    }
    // [GET] /verify
    viewVerify(req, res, next) {
        res.render('verify', { layout: 'content-only' });
    }

    // [POST] /verify
    async verify(req, res, next) {
        try {
            const { token } = req.body;
            const userId = req.user._id;
            const verified = true// await UserService.verifyToken(userId, token);
            if (verified) {
                req.session.authenByCode = true;
                console.log('User authenticated, session authenticated set:', req.session.authenticated);
                res.status(200).json('Verification is successful');
            } else {
                console.log('Invalid token');
                res.status(401).json({ message: 'Unauthorized: Invalid token or authentication failed' });
            }
        } catch (error) {
            console.error('Error during verification:', error);
            next(error);
        }
    }
    // [GET] /logout
    logout (req, res,next){
        req.logout((err) => {
            if (err) {
                return res.status(500).send('Error logging out');
            }
            res.redirect('/auth/login'); // Chuyển hướng về trang đăng nhập
        });
    };
    confirmEmail (req, res,next){
      return res.render('notify', { layout: 'content-only', email: req.user.email });
    };
    

}

module.exports = new AuthController();