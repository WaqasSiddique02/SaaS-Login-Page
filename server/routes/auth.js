var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();
const passport = require('passport');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({ message: "Login successful", user: { email: user.email, username: user.username } });
    } catch (err) {
        console.error("Error in user login:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.send("authenticated")
    }
);

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.send("Logged out");
    });
});

router.get('/user', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ user: req.user });
});

module.exports = router;