export class GetUserById {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Korisnik nije pronađen");
    }
    return user;
  }
}