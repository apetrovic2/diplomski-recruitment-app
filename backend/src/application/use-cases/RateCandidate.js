export class RateCandidate {
  constructor(applicationRepository) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicationId, rating, note) {
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error("Ocena mora biti između 1 i 5");
    }
    return await this.applicationRepository.updateRating(applicationId, rating, note);
  }
}