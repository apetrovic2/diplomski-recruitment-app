export class ScheduleInterview {
  constructor(applicationRepository) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicationId, interviewDate) {
    if (!interviewDate) {
      throw new Error("Datum intervjua je obavezan");
    }
    return await this.applicationRepository.updateInterviewDate(applicationId, interviewDate);
  }
}