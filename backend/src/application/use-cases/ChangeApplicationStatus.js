export class ChangeApplicationStatus{
    constructor(applicationRepository){
        this.applicationRepository = applicationRepository;
    }

    async execute(applicationId, newStatus){
        const dozvoljeniStatusi = ["Prijavljen", "Pregledan", "Intervju", "Odluka"];
        if (!dozvoljeniStatusi.includes(newStatus)) {
            throw new Error("Nevažeći status");
        }
        return await this.applicationRepository.updateStatus(applicationId,newStatus);
    }
}