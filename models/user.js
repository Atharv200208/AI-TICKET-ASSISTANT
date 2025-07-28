import mongoose from 'mongoose';


const userSchema = new monngoose.Schema({
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type:String,
        default: "user",
        enum:["user", "moderator", "admin"]
    },
    skills:{
        type: [String],
        default:[]
    },
    createdAt:{
        type: Date,
        default: Date.now
    }  
})

export const User = mongoose.model('User', userSchema);