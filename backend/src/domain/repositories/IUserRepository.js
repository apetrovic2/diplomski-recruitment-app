export class IUserRepository{
    async save(user){
        throw new Error("Metoda save() nije implementirana");
    }
    async findByEmail(email){
        throw new Error("Metoda findByEmail() nije implementirana");
    }
    async findById(id){
        throw new Error("Metoda findById() nije implementirana");
    }
}