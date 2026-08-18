export class IApplicationRepository{
    async save(application){
        throw new Error("Metoda save() nije implementirana");
    }
    async findAll(){
        throw new Error("Metoda findAll() nije implementirana");
    }
    async findByCandidateId(id){
        throw new Error("Metoda findByCandidateId nije implementirana");
    }
    async findByJobId(id){
        throw new Error("Metoda findByJobId nije implementirana");
    }
    async updateStatus(applicationId, newStatus){
        throw new Error("Metoda updateStatus() nije implementirana");
    }
}