import { User } from "../../../../domain/entities/User.js";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";
import { UserModel } from "../models/UserModel.js";

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
        return await UserModel.findById(id);
    }

    async updateCv(userId, cvUrl) {
        return await UserModel.findByIdAndUpdate(userId, { cvUrl }, { new: true });
    }

    async deleteCv(userId) {
        return await UserModel.findByIdAndUpdate(userId, { cvUrl: null }, { new: true });
    }

    async updateVerificationStatus(userId, emailVerified, verificationToken) {
        return await UserModel.findByIdAndUpdate(userId, { emailVerified, verificationToken }, { new: true });
    }
    
    async findByVerificationToken(token) {
        return await UserModel.findOne({ verificationToken: token });
    }
}