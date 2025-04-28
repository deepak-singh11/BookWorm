import jwt, { decode } from 'jsonwebtoken';
import 'dotenv/config';
import User from '../model/userModel.js';

const authUser=async(req,res,next)=>{
    try {
        const token=req.cookies.authToken;
        if(!token){
            return res.status(401).json({message:"Token doesn't exist, Unauthorized!"});
        }
        // Extracting userId into tokenData from the token
        const {tokenData}=jwt.verify(token,process.env.JWT_SECRET_KEY);
        
        // Confirming user Exist.
        const userExist=User.findById({_id:tokenData});
        if(!userExist){
            return res.status(401).json({message:"user's doesn't exist"});
        }
        req.userId=tokenData;
        next();      

    } catch (error) {
        console.log("error occured in authUser Middleware",error.message);
        res.status(401).json({message:"Token is not valid"});
    }
    
}

export default authUser;