import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDb = async() =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to database successfully");
    } catch (error) {
        console.log("Error connecting to database", error);
        throw error;
    }
}

export default connectDb;