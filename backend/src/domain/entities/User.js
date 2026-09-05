export class User{
    constructor(name, email, passwordHash, role="candidate"){
        if(!name || name.trim() === ""){
            throw new Error("Ime je obavezno");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!email || !emailRegex.test(email)){
            throw new Error("Email nije validan");
        }
        if(!passwordHash){
            throw new Error("Lozinka je obavezna");
        }
        if (passwordHash.length < 8) {
            throw new Error("Lozinka mora imati bar 8 karaktera");
        }
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }
}