export class DeleteJob {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(jobId) {
    const deleted = await this.jobRepository.deleteJob(jobId);
    if (!deleted) {
      throw new Error("Oglas nije pronađen");
    }
    return deleted;
  }
}