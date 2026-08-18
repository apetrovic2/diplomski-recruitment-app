import { Application } from "../../domain/entities/Application.js";

export class ApplyToJob{
    constructor(applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    async execute(candidateId, jobId){
        const application = new Application(candidateId, jobId)
        const saveApplication =  await this.applicationRepository.save(application);
        return saveApplication;
    }
}