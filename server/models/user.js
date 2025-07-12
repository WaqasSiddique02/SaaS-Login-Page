const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
        },
        username: {
                type: String,
                required: true,
                trim: true,
        },
        password: {
                type: String,
                minlength: 6,
        },
        country: {
                type: String,
                trim: true,
        },
        phone: {
                type: String,
                trim: true,
                unique: true,
                sparse: true,
        },
        googleId: {
                type: String,
                unique: true,
                sparse: true,
        },
        avatar: {
                type: String,
        },
        createdAt: {
                type: Date,
                default: Date.now,
        },
        resetOtp: String,
        resetOtpExpiry: Date,
});

module.exports = mongoose.model('User', userSchema);