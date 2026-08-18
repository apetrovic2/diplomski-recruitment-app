import { RegisterUser } from "../../../application/use-cases/RegisterUser.js";
import { LoginUser } from "../../../application/use-cases/LoginUser.js";
import { MongoUserRepository } from "../../database/mongoose/repositories/MongoUserRepository.js";


const userRepository = new MongoUserRepository();
const registerUserUseCase = new RegisterUser(userRepository);
const loginUserUseCase = new LoginUser(userRepository);

export async function register(req, res){
    try{
        const { name, email, password, role} = req.body;
        const newUser = await registerUserUseCase.execute(name, email, password, role);

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        });
    } catch(error){
        res.status(400).json({message: error.message});
    }
}

export async function login(req, res){
    try{
        const { email, password} = req.body;
        const { token, user} = await loginUserUseCase.execute(email, password);
        res.status(200).json({
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
        });
    } catch(error){
        res.status(401).json({message:error.message});
    }
}