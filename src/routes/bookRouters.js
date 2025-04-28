import express from 'express';
import 'dotenv/config';
import cloudinary from '../cloudinary/cloudinary.js';
import User from '../model/userModel.js';
import authUser from '../middleware/authUser.js';
import Book from '../model/bookModel.js';
const Router=express.Router();

// Route to create new Book Post
Router.post("/create",authUser,async (req,res)=>{
    try {        
        const {title,caption,rating,image}=req.body;
        if(!title||!caption||!rating||!image){
            return res.status(400).json({message:"All Fields are Required"});
        }
        // upload image to cloudinary
        const uploadResponse=await cloudinary.uploader.upload(image);
        const imageUrl=uploadResponse.secure_url;

        // save to the database
        const newUser= await User.create({
            title,
            caption,
            rating,
            image:imageUrl,
            user:req.userId,
        });
        res.status(201).json({message:"user created successfully"});
    
    } catch (error) {
        console.log("error occur in create book route");
    }


})
// Route To see all Books
Router.get("/allbooks",authUser,async(req,res)=>{
    try {
        const page=req.query.page||1;
        const limit=req.query.limit||5;
        const skip=(page-1)*limit;
        
        const books=(await Book.find().sort({createdAt:-1}).skip(skip)).limit(limit).populate("user","username profileImage");

        const totalBooks=await Book.countDocuments();

        res.send({
            books,
            currentPage:page,
            totalBooks,
            totalPages:Math.ceil(totalBooks/limit),
        });

    } catch (error) {
        console.log("error in all books route",error.message);
        res.status(401).json({message:"Internal server error"});
    }
})


// Route for Post deletion:
Router.delete("/:id",authUser,async(req,res)=>{
    try{

        const id=req.params.id;

        // Searching book in DB
        const book=await Book.findById(id);
        
        if(book.user.toString()!==req.user._id.toString())
            return res.status(401).json({message:"Unauthorized"});

        // Deleting book image from cloudinary  
        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId=book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }catch(deleteError){
                console.log("error deleting image from cloudinary",deleteError);
            }
        }
        // Deleting book from DB
        await book.deleteOne();

    }catch(err){
        console.log("Error occured in post deletion route", err.message);
        res.status(400).json({message:"Internal server error"});
    }
})

// Route for published books by the Logged user

Router.get("/user",authUser,async(req,res)=>{
    try{
        const books=await Book.find({user:req.userId}).sort({created:-1});
        res.json(books);
    }catch(error){
        console.log("get user books error:",error.message);
        res.status(500).json({message:"Server error"});
    }
})


export default Router;