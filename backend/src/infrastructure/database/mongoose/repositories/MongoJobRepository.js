import { IJobRepository } from "../../../../domain/repositories/IJobRepository.js";
import { JobListingModel } from "../models/JobListingModel.js";

export class MongoJobRepository extends IJobRepository {
  async save(jobListing) {
    const created = await JobListingModel.create({
      title: jobListing.title,
      company: jobListing.company,
      status: jobListing.status,
      workArrangement: jobListing.workArrangement,
      field: jobListing.field,
      city: jobListing.city,
      educationLevel: jobListing.educationLevel,
      employmentType: jobListing.employmentType,
      workHours: jobListing.workHours,
      experienceLevel: jobListing.experienceLevel,
      applicationDeadline: jobListing.applicationDeadline,
      createdBy: jobListing.createdBy,
    });
    return created;
  }

  async findAll() {
    return await JobListingModel.find();
  }

  async findById(id) {
    return await JobListingModel.findById(id);
  }
  async deleteJob(id) {
  return await JobListingModel.findByIdAndDelete(id);
}
}