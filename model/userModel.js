const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter your Name']
    },
    email:{
        type:String,
        required:[true,'please enter your email'],
        unique: true,
        lowercase: true,
        validate :[validator.isEmail,'please enter a valid email']
    },
    phone:{
        type:Number,
        // required:[true,'please enter your Number'],
        unique: true,
        // lowercase: true,
        // validate :[validator.isEmail,'please enter a valid email']
    },
    password:{
        type:String,
        required: [true,'please enter a password'],
        minlength: 8,
        select:false
    },
    confirmPassword:{
        type:String,
        // required:[true,'please confirm your password'],
        // validate: {
        //     validator: function(val){
        //         return this.password == val;
        //     },
        //     message:'password and confirmPassword do not match'
        // }
    },
    isVerified: {
        type: Boolean,
        default: false,
      },
    verificationCode: {
        type: String,
      },
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
})
userSchema.methods.checkPasswordInDb = async function(pass,passDb){
    return await bcrypt.compare(pass,passDb);
}

const User = mongoose.model('User',userSchema);

module.exports  = User;