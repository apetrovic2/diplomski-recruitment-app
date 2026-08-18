import { User } from "../../../../domain/entities/User";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { UserModel } from "../models/UserModel";

export class MongoUserRepository extends IUserRepository{
    async save(user){
        const created = await UserModel.create({
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
        });
        return created;
    }

    async findByEmail(email){
        return await UserModel.findOne({email});
    }

    async findById(id){
        return await UserModel.findOne({id});
    }
}