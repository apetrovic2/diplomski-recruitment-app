  import { JobListing } from "../../domain/entities/JobListing.js";

  export class CreateJobListing {
    constructor(jobRepository) {
      this.jobRepository = jobRepository;
    }

    async execute(title, company, workArrangement, field, city, educationLevel, employmentType, workHours, experienceLevel, applicationDeadline, createdBy) {
      const job = new JobListing(title, company, workArrangement, field, city, educationLevel, employmentType, workHours, experienceLevel, applicationDeadline, createdBy);
      const savedJob = await this.jobRepository.save(job);
      return savedJob;
    }
  }