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
  
  async deleteJob(id) {
  throw new Error("Metoda deleteJob() nije implementirana");
  }
  
  async updateJob(id, data) {
  throw new Error("Metoda updateJob() nije implementirana");
  }
}