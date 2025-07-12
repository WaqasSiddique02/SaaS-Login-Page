var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/register',async function(req,res){
  try{
    const {email, username, password, country, phone} = req.body;

    const existingUser=await User.findOne({email});
    if(existingUser){
      return res.status(409).json({message:"User already exists with this email"});
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const user= new User({email,username,password:hashedPassword,country,phone});
    await user.save();
    return res.status(201).json({message: "User registered successfully"});
  }catch(err){
    console.error("Error in user registration:", err);
    return res.status(500).json({message: "Internal Server Error"});
  }
});

router.get('/',async function(req,res){
  try{
    const users = await User.find({});
    return res.status(200).json(users);
  }catch(err){
    console.error("Error fetching users:", err);
    return res.status(500).json({message: "Internal Server Error"});
  }
});

router.get('/:email',async function(req,res){
  try{
    const user = await User.findOne({email: req.params.email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    return res.status(200).json(user);
  }catch(err){
    console.error("Error fetching user:", err);
    return res.status(500).json({message: "Internal Server Error"});
  }
});

router.put('/:email',async function(req,res){
  try{
    const {username, password, country, phone} = req.body;
    const user = await User.findOne({email: req.params.email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    user.username = username || user.username;
    user.password = password ? await bcrypt.hash(password, 10) : user.password;
    user.country = country || user.country;
    user.phone = phone || user.phone;
    await user.save();
    return res.status(200).json({message: "User updated successfully"});
  }catch(err){
    console.error("Error updating user:", err);
    return res.status(500).json({message: "Internal Server Error"});
  }
});

router.delete('/:email',async function(req,res){
  try{
    const user = await User.findOneAndDelete({email: req.params.email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    return res.status(200).json({message: "User deleted successfully"});
  }catch(err){
    console.error("Error deleting user:", err);
    return res.status(500).json({message: "Internal Server Error"});
  }
});

module.exports = router;