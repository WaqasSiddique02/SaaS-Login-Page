var express = require('express');
var router = express.Router();
const User = require('../models/user');
const transporter = require('../utils/mailer');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/send_otp', async function (req, res) {
    const { email } = req.body;
    try {
       const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000;
        user.resetOtp = otp;
        user.resetOtpExpiry = expiry;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        return res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error("Error in forgot password:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/send_otp/2fa', async function (req, res) {
    const { email } = req.body;
    try {
       const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000;
        user.resetOtp = otp;
        user.resetOtpExpiry = expiry;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '2FA OTP ',
            text: `Your OTP for 2FA is ${otp}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        return res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.error("Error in forgot password:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/verify_otp', async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpiry) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    return res.json({ message: 'OTP verified. Proceed to further action.' });
});

module.exports = router;