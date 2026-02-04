import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
   username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        mobilenumber: {
            type: Number,
            unique: true,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
},{timestamps: true})


export const User = mongoose.model("User",userSchema);

