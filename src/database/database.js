import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async() => {
    try{
        const response =await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected");
    }catch(error){
        console.log("Error occured", error);
    }  
  
};
