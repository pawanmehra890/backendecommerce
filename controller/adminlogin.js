const express = require('express')
const userModel = require('../model/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const key = 'paoooooooooooooooosoosnbdhdbhcdbdbjhbdcbjhc'

const adminRoutes = express.Router()

adminRoutes.post('/adminregister', async (req, res) => {
    try {
        const { name, email, password, phone,role } = req.body;

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }
        const newUser = new userModel({
            name,
            email,
            password, // Save hashed password to the database
            phone,role
        });
        // Save the new user to the database
        await newUser.save();
        // Respond with success message
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // Handle errors
        console.error("Error in user registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


 adminRoutes.post('/adminlogin', async (req, res) => {
    const emailExist = await userModel.findOne({ email: req.body.email })
    if (!emailExist) {
        res.status(404).json({ msg: "please login" })
    } else {
        const token = await jwt.sign({ id: emailExist._id,role:emailExist.role }, key, { expiresIn: '2d' })
        res.status(201).json({ token, emailExist })
    }
})


module.exports = adminRoutes