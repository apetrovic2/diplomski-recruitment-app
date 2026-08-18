import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    emai: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum:["admin","candidate"], default: "candidate"}
},{ timestamps:true});

export const UserModel = mongoose.model("User", userSchema);