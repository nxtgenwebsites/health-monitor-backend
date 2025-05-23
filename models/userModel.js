import mongoose from "mongoose";

const nextOfKinSchema = new mongoose.Schema({
    kin_name: { type: String},
    kin_relationship: { type: String},
    kin_gender: { type: String},
    kin_email: { type: String},
    kin_contact_no: { type: String},
}, { _id: false });

const userSchema = mongoose.Schema({
    title:{
        type: String,
    },
    name:{
        type: String,
    },
    middle_name:{
        type: String,
    },
    last_name:{
        type: String,
    },
    email:{
        type: String,
    },
    password:{
        type: String,
    },
    gender:{
        type: String,
    },
    nationality:{
        type: String,
    },
    marital_status:{
        type: String,
    },
    dob:{
        type: String,
    },
    relationship:{
        type: String,
    },
    contact_no:{
        type: String,
    },
    education_level:{
        type: String,
    },
    password:{
        type: String,
    },
    employment_status:{
        type: String,
    },
    country:{
        type: String,
    },
    state:{
        type: String,
    },
    city:{
        type: String,
    },
    town:{
        type: String,
    },
    address:{
        type: String,
    },
    children_no:{
        type: String,
    },
    children_number:{
        type: Number,
    },
    children_gender:{
        type: String,
    },
    children_dob:{
        type: String,
    },
    next_of_kin: [nextOfKinSchema],
    notes:{
        type: String,
    },
    role: {
        type: String,
        default: 'patient'
    },
    isBlocked: {
        type: Boolean,
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps : true})

const userModel = mongoose.model('users' , userSchema);
export default userModel;