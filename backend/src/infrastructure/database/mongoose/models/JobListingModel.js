import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  status: { type: String, default: "active" },
});

export const JobListingModel = mongoose.model("JobListing", jobSchema);