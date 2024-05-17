const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const User=new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:Number
    },
    password:{
     type:String
    },
    role:{
        type: String,
        enum: ['user', 'admin'], // Define the possible roles
        default: 'user' // Default role for new users
    }
})

User.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
})

module.exports=mongoose.model('user',User)