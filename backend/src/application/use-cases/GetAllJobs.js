export class GetAllJobs {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute() {
    return await this.jobRepository.findAll();
  }
}