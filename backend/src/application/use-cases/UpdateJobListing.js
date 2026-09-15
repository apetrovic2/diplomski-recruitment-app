export class UpdateJobListing {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(jobId, data) {
    if (!data.title || data.title.trim() === "") {
      throw new Error("Naslov oglasa je obavezan");
    }
    const updated = await this.jobRepository.updateJob(jobId, data);
    if (!updated) {
      throw new Error("Oglas nije pronađen");
    }
    return updated;
  }
}