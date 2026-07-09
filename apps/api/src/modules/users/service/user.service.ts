import { UserRepository } from "../repository/user.repository.ts";
import { Prisma } from "@prisma/client";
import { hashPassword, comparePassword } from '../../../utils/password.util.ts';
import { ConflictError } from "../../../common/errors/index.ts";
import { ERROR_CODE } from "../../../common/constants/index.ts";

/**
 * UserService class provides methods for managing user profiles, 
 * including updating profile information, 
 * changing passwords, 
 * deleting accounts, 
 * and fetching user profiles. 
 * It interacts with the UserRepository to perform database operations.   
 */
export class UserService {

    constructor(
        private userRepository: UserRepository = new UserRepository()
    ) { }

    /**
     * Update user profile information
     * @param userId - The unique ID of the user to update
     * @param updateData - The data to update for the user
     * @returns The updated user object
     */
    async updateProfile(userId: string, updateData: Prisma.UserUpdateInput) {
        
        // Check if the user exists before attempting to update
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ConflictError("user.userNotFound", ERROR_CODE.NOT_FOUND);
        }

        // Logic to update user profile in the database
        const updatedUser = await this.userRepository.update(userId, updateData);
        
        return updatedUser;

    }

    /**
     * Change user password
     * @param userId - The unique ID of the user changing their password
     * @param oldPassword - The current password of the user
     * @param newPassword - The new password to set for the user
     * @returns The updated user object with the new password
     * @throws ConflictError if the user is not found or if the old password is incorrect
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        
        // Check if the user exists before attempting to change the password
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ConflictError("user.userNotFound", ERROR_CODE.NOT_FOUND);
        }
    
        // Verify the old password
        const isOldPasswordValid = await comparePassword(oldPassword, user.passwordHash || "");
        if (!isOldPasswordValid) {
            throw new ConflictError("user.oldPasswordIncorrect", ERROR_CODE.INVALID_CREDENTIALS);
        }
        // Hash the new password and update it in the database
        const hashedNewPassword = await hashPassword(newPassword);
        
        // Update the user's password in the database
        const updatedUser = await this.userRepository.update(userId, { passwordHash: hashedNewPassword });
        
        return updatedUser;
    }

    /**
     * Delete user account
     * @param userId - The unique ID of the user to delete
     * @returns The deleted user object
     * @throws ConflictError if the user is not found
    */
    async deleteMyAccount(userId: string) {
        
        // Check if the user exists before attempting to delete
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ConflictError("user.userNotFound", ERROR_CODE.NOT_FOUND);
        }

        // Logic to delete user account from the database
        const deletedUser = await this.userRepository.delete(userId);
        if (!deletedUser) {
            throw new ConflictError("user.userNotFound", ERROR_CODE.NOT_FOUND);
        }
        
        return deletedUser;

    }

    /**
     * Fetch user profile information
     * @param userId - The unique ID of the user to fetch
     * @returns The user object containing profile information
     * @throws ConflictError if the user is not found
     * 
    */
    async getMyProfile(userId: string) {
        
        // Check if the user exists before attempting to fetch profile
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ConflictError("user.userNotFound", ERROR_CODE.NOT_FOUND);
        }

        return user;
    }
}