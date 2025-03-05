import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    middle_name:{
        type: String,
    },
    last_name:{
        type: String,
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'patient'
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    }
}, { timestamps : true})

const userModel = mongoose.model('users' , userSchema);
export default userModel;