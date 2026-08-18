export class Application {
  constructor(candidateId, jobId) {
    if (!candidateId) {
      throw new Error("ID kandidata je obavezan");
    }
    if (!jobId) {
      throw new Error("ID oglasa je obavezan");
    }

    this.candidateId = candidateId;
    this.jobId = jobId;
    this.status = "Prijavljen";
    this.cvUrl = null;
    this.interviewDate = null;
  }
}