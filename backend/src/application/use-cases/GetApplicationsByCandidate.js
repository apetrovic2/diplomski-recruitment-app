export class GetApplicationsByCandidate{
    constructor(applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    async execute(candidateId){
        const applications = await this.applicationRepository.findByCandidateId(candidateId);
        return applications;
    }

}
