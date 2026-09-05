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
    async updateCv(applicationId, cvUrl){
        throw new Error("Metoda updateCv() nije implementirana");
    }
    async updateInterviewDate(applicationId, interviewDate) {
        throw new Error("Metoda updateInterviewDate() nije implementirana");
    }
    async updateRating(applicationId, rating, note) {
        throw new Error("Metoda updateRating() nije implementirana");
    }
}