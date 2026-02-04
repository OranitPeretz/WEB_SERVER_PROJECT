

exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    next();
};
