export class UploadUserCv {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, cvUrl) {
    return await this.userRepository.updateCv(userId, cvUrl);
  }
}