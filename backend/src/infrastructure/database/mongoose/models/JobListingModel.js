import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  status: { type: String, default: "active" },
  workArrangement: {
    type: String,
    enum: ["U kancelariji", "Na terenu", "Hibridno", "Remote"],
  },
  field: { type: String },
  city: { type: String },
  educationLevel: { type: String },
  employmentType: {
    type: String,
    enum: ["Ugovor na neodređeno", "Ugovor na određeno", "Honorarno", "Praksa", "Sezonski posao"],
  },
  workHours: {
    type: String,
    enum: ["Puno radno vreme", "Nepuno radno vreme"],
  },
  experienceLevel: {
    type: String,
    enum: ["Pripravnik", "Junior", "Medior", "Senior"],
  },
  applicationDeadline: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
}, { timestamps: true });

export const JobListingModel = mongoose.model("JobListing", jobSchema);