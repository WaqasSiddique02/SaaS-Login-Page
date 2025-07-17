var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();
const passport = require("passport");
const transporter = require("../utils/mailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.googleId) {
      return res.status(403).json({
        message:
          "This account was created using Google authentication. Please sign in with Google.",
      });
    }

    if (!user.password) {
      return res.status(403).json({
        message:
          "No password set for this account. Please use alternative login method.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("https://saa-s-login-page-front-end.vercel.app/");
  }
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send("Logged out");
  });
});

router.get("/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ user: req.user });
});

module.exports = router;
