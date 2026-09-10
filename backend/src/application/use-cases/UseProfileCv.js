export class UseProfileCv {
  constructor(applicationRepository) {
    this.applicationRepository = applicationRepository;
  }

  async execute(applicationId, cvUrl) {
    if (!cvUrl) {
      throw new Error("Nema CV-ja na profilu za povezivanje");
    }
    return await this.applicationRepository.updateCv(applicationId, cvUrl);
  }
}