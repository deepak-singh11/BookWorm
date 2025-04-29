import express from 'express';
import 'dotenv/config';
import authRouters from './routes/authRouters.js';
import bookRouters from './routes/bookRouters.js'
import { connectDB } from './database/database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app=express();
const PORT=process.env.PORT;

app.use(cors({
    origin: '*', // or '*' for all origins in dev (NOT recommended in prod)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // allow custom headers from frontend
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRouters);
app.use('/api/books',bookRouters);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})