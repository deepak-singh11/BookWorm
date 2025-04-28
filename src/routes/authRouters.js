import express, { response } from 'express';
import User from '../model/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const Router=express.Router();

Router.post('/register',async(req,res)=>{
    let newUser;
    try {
        const {username,email,gender,password}=req.body;

        // Checking All Fields are available
        if(!username||!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }
        // Checking Existing user or not
        const userExist=await User.findOne({$or:[{username},{email}]});
        if(userExist){
            return res.status(400).json({message:"Username or Email already exist"});
        }
        
        // Password hashing
        const hashedPassword=await bcrypt.hash(password,10);

        let profileImage;
        gender==="male"? profileImage=`https://avatar.iran.liara.run/public/boy?username=${username}`:profileImage=`https://avatar.iran.liara.run/public/girl?username=${username}`;

        // Creating new User 
        newUser=await User.create({
            username,
            email,
            password:hashedPassword,
            gender,
            profileImage,
        });
        console.log(newUser);   

        const tokenData=newUser._id;
        console.log("tokenData is: ",tokenData);
        const token=jwt.sign({tokenData},process.env.JWT_SECRET_KEY,{
            expiresIn:"15d",
        });
        
        return res.status(200).json({
            message:"User Signup Successfully",
            token,
            user:{
                email,
                username,
                password,
                profileImage
            }
        });  

    } catch (error) {
        console.log("error in register route");

        // If user created but error occur in sending Cookie-->delete the user created in DB.
        if(newUser){
        await User.findByIdAndDelete({_id:newUser._id});
        console.log("user deleted due to error after creation");
        }
        res.status(500).json({message:"Internal server error" })
    }
});

Router.post('/login',async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({message:"All Fields are Required"});
        }
        const userExist=await User.findOne({email});
        
        if(!userExist){
            return res.status(401).json({message:"User doesn't exist"});
        }
        
        const checkPassword= await bcrypt.compare(password,userExist.password);
        
        if(!checkPassword){
            return res.status(400).json({message:"password doesn't match"});
        }

        const tokenData=userExist.username;
        const token=jwt.sign({tokenData},process.env.JWT_SECRET_KEY,{expiresIn:'15d'});
        
        res.cookie("authToken",token,{
            httpOnly:true,
            secure:true,
            sameSite:"lax",
            maxAge:7*24*60*60*1000
        })

        res.status(200).json({message:"Login Successfully"});
    } catch (error) {
        console.log("error occured in login route");
    }   
})

export default Router;