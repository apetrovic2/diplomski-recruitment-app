export class IJobRepository {
  async save(jobListing) {
    throw new Error("Metoda save() nije implementirana");
  }
  async findAll() {
    throw new Error("Metoda findAll() nije implementirana");
  }
   async findById(id) {
    throw new Error("Metoda findById() nije implementirana");
  }
}