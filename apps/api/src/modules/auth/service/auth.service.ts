import { AuthRepository } from '../repository/auth.repository.ts';

export class AuthService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    // async registerUser(data: ) {

    // }

    async getCurrentUserByEmail(email: string) {
        const user = await this.authRepository.findUserByEmail(email);
        return user;
    }
}