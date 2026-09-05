import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    jobId: { type:mongoose.Schema.Types.ObjectId, ref:"JobListing", required:true},
    status: { type: String, enum:["Prijavljen","Pregledan","Intervju","Odluka"], default:"Prijavljen"},
    cvUrl: { type: String, default:null},
    interviewDate: { type:Date, default:null},
    rating: { type: Number, min: 1, max: 5, default: null },
    note: { type: String, default: null }
},
{timestamps:true}
);

export const ApplicationModel = mongoose.model("Application", applicationSchema);