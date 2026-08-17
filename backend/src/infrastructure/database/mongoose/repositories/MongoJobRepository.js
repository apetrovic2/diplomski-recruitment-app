import { IJobRepository } from "../../../../domain/repositories/IJobRepository.js";
import { JobListingModel } from "../models/JobListingModel.js";

export class MongoJobRepository extends IJobRepository {
  async save(jobListing) {
    const created = await JobListingModel.create({
      title: jobListing.title,
      company: jobListing.company,
      status: jobListing.status,
    });
    return created;
  }

  async findAll() {
    return await JobListingModel.find();
  }
  
  async findById(id) {
    return await JobListingModel.findById(id);
  }
}