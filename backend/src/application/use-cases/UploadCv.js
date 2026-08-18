export class UploadCV{
    constructor(applicationRepository){
        this.applicationRepository = applicationRepository;
    }
    
    async execute(applicationId, cvUrl){
        return await this.applicationRepository.updateCv(applicationId,cvUrl);
    }
}