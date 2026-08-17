export class GetJobById {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(id) {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error("Oglas nije pronađen");
    }
    return job;
  }
}