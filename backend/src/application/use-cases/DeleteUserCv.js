export class DeleteUserCv {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    return await this.userRepository.deleteCv(userId);
  }
}