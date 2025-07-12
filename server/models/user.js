const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   email:{
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim:true
   },
    username:{
            type: String,
            required: true,
            trim:true
    },
    password:{
            type: String,
            required: true,
            minlength: 6
    },
    country:{
            type: String,
            required: true,
            trim:true
    },
    phone:{
            type: String,
            required: true,
            trim:true,
            unique: true,
            length:11
    },
    createdAt:{
            type: Date,
            default: Date.now
    },
    resetOtp: String,
    resetOtpExpiry: Date,
});

module.exports = mongoose.model('User', userSchema);