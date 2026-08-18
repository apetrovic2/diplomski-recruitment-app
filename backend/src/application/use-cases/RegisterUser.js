import bcrypt from "bcrypt"
import { User } from "../../domain/entities/User.js";

export class RegisterUser{
    constructor(userRepository){
        this.userRepository = userRepository
    }

    async execute(name, email, plainPassword, role){
        const existingUser = await this.userRepository.findByEmail(email);
        if(existingUser){
            throw new Error("Korisnik sa ovim emailom vec postoji");
        }
        
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        const user = new User(name, email, passwordHash, role);
        const savedUser = await this.userRepository.save(user);

        return savedUser;
    }
}