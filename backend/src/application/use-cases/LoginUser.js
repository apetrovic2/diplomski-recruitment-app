import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export class LoginUser{
    constructor(userRepository){
        this.userRepository = userRepository
    }

    async execute(email, plainPassword){
        const user = await this.userRepository.findByEmail(email);
        if(!user){
            throw new Error("Pogresan email ili lozinka");
        }

        const isPasswordValid = await bcrypt.compare(plainPassword, user.passwordHash);
        if(!isPasswordValid){
            throw new Error("Pogresan email ili lozinka");
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        return {token, user};
    }
}