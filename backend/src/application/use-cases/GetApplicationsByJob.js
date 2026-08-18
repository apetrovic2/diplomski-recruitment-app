export class GetApplicationsByJob{
    constructor(applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    async execute(id){
        const applications = await this.applicationRepository.findByJobId(id);  
        return applications;
    }
}