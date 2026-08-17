import { JobListing } from "../../domain/entities/JobListing.js";

export class CreateJobListing {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(title, company) {
    const job = new JobListing(title, company);
    const savedJob = await this.jobRepository.save(job);
    return savedJob;
  }
}