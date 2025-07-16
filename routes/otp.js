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

router.post('/verify_otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "MISSING_FIELDS",
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "USER_NOT_FOUND",
                message: "No user found with this email"
            });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({
                success: false,
                error: "INVALID_OTP",
                message: "The OTP you entered is incorrect"
            });
        }

        if (Date.now() > user.resetOtpExpiry) {
            return res.status(400).json({
                success: false,
                error: "EXPIRED_OTP",
                message: "This OTP has expired"
            });
        }
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        user.isEmailVerified = true;
        await user.save();

        req.login(user, (err) => {
            if (err) {
                console.error("Session error:", err);
                return res.status(500).json({
                    success: false,
                    error: "SESSION_ERROR",
                    message: "Error creating user session"
                });
            }
            
            return res.json({
                success: true,
                message: "OTP verified successfully",
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        });

    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({
            success: false,
            error: "SERVER_ERROR",
            message: "An internal server error occurred"
        });
    }
});

module.exports = router;