const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

exports.showLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.showRegister = (req, res) => {
    res.render('register', { error: null });
};

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    userModel.createUser(username, hash, async err => {
        if (err) return res.render('register', { error: 'User already exists' });
        // load user and set session
        userModel.findUserByUsername(username, (err, user) => {
            if (err || !user) return res.render('register', { error: 'Registration succeeded but could not log you in. Please login.' });
            req.session.user = user;
            res.redirect('/home');
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    userModel.findUserByUsername(username, async (err, user) => {
        if (!user) {
            return res.render("login", { error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render("login", { error: "Invalid credentials" });
        }

        req.session.user = user;
        res.redirect("/home");
    });
};


exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

exports.home = (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('home', { user: req.session.user });
};
