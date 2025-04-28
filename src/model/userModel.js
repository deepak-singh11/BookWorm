import mongoose, { mongo, Mongoose, Types } from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    gender:{
        type:String,
        enum:["male","female"],
        required:true,
    },
    profileImage:{
        type:String,
        default:"",

    }
},{timestamps:true})

const User=mongoose.model("User",userSchema);

export default User; 