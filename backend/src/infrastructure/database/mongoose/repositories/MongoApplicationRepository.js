import { ApplicationModel } from "../models/ApplicationModel.js";
import { IApplicationRepository } from "../../../../domain/repositories/IApplicationRepository.js";

export class MongoApplicationRepository extends IApplicationRepository{
    async save(application){
        const created = await ApplicationModel.create({
            candidateId: application.candidateId,
            jobId: application.jobId,
            status: application.status,
            cvUrl: application.cvUrl,
            interviewDate: application.interviewDate
        });
        return created;
    }

    async findAll(){
        return await ApplicationModel.find();
    }

    async findByCandidateId(id){
        return await ApplicationModel.find({candidateId: id});
    }

    async findByJobId(id){
        return await ApplicationModel.find({jobId:id});
    }

    async updateStatus(applicationId, newStatus){
        return await ApplicationModel.findByIdAndUpdate(applicationId, {status: newStatus}, {new:true});
    }

    async updateCv(applicationId, cvUrl){
        return await ApplicationModel.findByIdAndUpdate(applicationId, {cvUrl: cvUrl}, {new:true});
    }

    async updateInterviewDate(applicationId, interviewDate) {
        return await ApplicationModel.findByIdAndUpdate(applicationId, { interviewDate }, { new: true });
    }

    async updateRating(applicationId, rating, note) {
        return await ApplicationModel.findByIdAndUpdate(applicationId, { rating, note }, { new: true });
    }
}
