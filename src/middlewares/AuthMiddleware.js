module.exports = {
  ensureLogin: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/auth/login');
    }
  },
  ensureAuthenticated:(req, res, next)=> {
    if (req.isAuthenticated()) {
        if (!req.user.isConfirmed) {
            return res.redirect('/auth/instruction'); // Redirect đến trang xác thực email
        }
        if (!req.session.authenByCode) {
            return res.redirect('/auth/verify'); // Redirect nếu tài khoản bị khóa
        }
        return next();
    }
    res.redirect('/auth/login'); // Redirect nếu chưa đăng nhập
  },  

  ensureRole: (role) => {
    return (req, res, next) => {
      if (req.isAuthenticated() && req.user.role === role) {
        return next();
      } else {
        res.status(403).send('Access Denied');
      }
    };
  },
};