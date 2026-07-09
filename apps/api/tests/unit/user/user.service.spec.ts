import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../src/modules/users/service/user.service";
import { ConflictError } from "../../../src/common/errors";
vi.mock("../../../src/utils/password.util", () => ({
    comparePassword: vi.fn(),
    hashPassword: vi.fn(),
}));

import { comparePassword, hashPassword } from "../../../src/utils/password.util";

describe("UserService", () => {
    let userService: UserService;
    let userRepository: any;

    beforeEach(() => {
        vi.clearAllMocks();

        userRepository = {
            findById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        userService = new UserService(userRepository);
    });

    describe("getMyProfile", () => {
        it("should return user profile successfully", async () => {
            const mockUser = {
                id: "1",
                email: "john@example.com",
                fullName: "John Doe",
            };

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await userService.getMyProfile("1");

            expect(result).toEqual(mockUser);
            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.findById).toHaveBeenCalledWith("1");
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(userService.getMyProfile("1")).rejects.toBeInstanceOf(
                ConflictError,
            );

            await expect(userService.getMyProfile("1")).rejects.toMatchObject({
                message: "user.userNotFound"
            });

            expect(userRepository.findById).toHaveBeenCalledWith("1");
        });

        it("should propagate repository errors", async () => {
            const dbError = new Error("Database error");

            userRepository.findById.mockRejectedValue(dbError);

            await expect(userService.getMyProfile("1")).rejects.toThrow(
                "Database error",
            );

            expect(userRepository.findById).toHaveBeenCalledWith("1");
        });
    });

    describe("updateProfile", () => {
        it("should update user profile successfully", async () => {
            const existingUser = {
                id: "1",
                fullName: "John Doe",
                email: "john@example.com",
            };

            const updateData = {
                fullName: "John Updated",
                avatarUrl: "avatar.png",
            };

            const updatedUser = {
                ...existingUser,
                ...updateData,
            };

            userRepository.findById.mockResolvedValue(existingUser);
            userRepository.update.mockResolvedValue(updatedUser);

            const result = await userService.updateProfile("1", updateData);

            expect(result).toEqual(updatedUser);

            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.findById).toHaveBeenCalledWith("1");

            expect(userRepository.update).toHaveBeenCalledTimes(1);
            expect(userRepository.update).toHaveBeenCalledWith("1", updateData);
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(
                userService.updateProfile("1", {
                    fullName: "John Updated",
                }),
            ).rejects.toBeInstanceOf(ConflictError);

            await expect(
                userService.updateProfile("1", {
                    fullName: "John Updated",
                }),
            ).rejects.toThrow("user.userNotFound");

            expect(userRepository.findById).toHaveBeenCalledWith("1");
            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate repository update errors", async () => {
            const existingUser = {
                id: "1",
                fullName: "John Doe",
            };

            const updateData = {
                fullName: "John Updated",
            };

            userRepository.findById.mockResolvedValue(existingUser);
            userRepository.update.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                userService.updateProfile("1", updateData),
            ).rejects.toThrow("Database error");

            expect(userRepository.findById).toHaveBeenCalledWith("1");
            expect(userRepository.update).toHaveBeenCalledWith("1", updateData);
        });
    });

    describe("changePassword", () => {
        it("should change password successfully", async () => {
            const user = {
                id: "1",
                passwordHash: "old-hash",
            };

            userRepository.findById.mockResolvedValue(user);

            vi.mocked(comparePassword).mockResolvedValue(true);
            vi.mocked(hashPassword).mockResolvedValue("new-hash");

            userRepository.update.mockResolvedValue({
                ...user,
                passwordHash: "new-hash",
            });

            const result = await userService.changePassword(
                "1",
                "old-password",
                "new-password",
            );

            expect(comparePassword).toHaveBeenCalledWith(
                "old-password",
                "old-hash",
            );

            expect(hashPassword).toHaveBeenCalledWith("new-password");

            expect(userRepository.update).toHaveBeenCalledWith("1", {
                passwordHash: "new-hash",
            });

            expect(result.passwordHash).toBe("new-hash");
        });

        it("should throw when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(
                userService.changePassword("1", "old", "new"),
            ).rejects.toBeInstanceOf(ConflictError);

            expect(comparePassword).not.toHaveBeenCalled();
            expect(hashPassword).not.toHaveBeenCalled();
            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it("should throw when old password is incorrect", async () => {
            userRepository.findById.mockResolvedValue({
                id: "1",
                passwordHash: "old-hash",
            });

            vi.mocked(comparePassword).mockResolvedValue(false);

            await expect(
                userService.changePassword("1", "wrong-password", "new-password"),
            ).rejects.toBeInstanceOf(ConflictError);

            expect(hashPassword).not.toHaveBeenCalled();
            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate hash password errors", async () => {
            userRepository.findById.mockResolvedValue({
                id: "1",
                passwordHash: "old-hash",
            });

            vi.mocked(comparePassword).mockResolvedValue(true);

            vi.mocked(hashPassword).mockRejectedValue(
                new Error("Hash failed"),
            );

            await expect(
                userService.changePassword("1", "old", "new"),
            ).rejects.toThrow("Hash failed");

            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it("should propagate repository update errors", async () => {
            userRepository.findById.mockResolvedValue({
                id: "1",
                passwordHash: "old-hash",
            });

            vi.mocked(comparePassword).mockResolvedValue(true);
            vi.mocked(hashPassword).mockResolvedValue("new-hash");

            userRepository.update.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                userService.changePassword("1", "old", "new"),
            ).rejects.toThrow("Database error");
        });
    });

    describe("deleteMyAccount", () => {
        it("should delete user account successfully", async () => {
            const user = {
                id: "1",
                fullName: "John Doe",
            };

            userRepository.findById.mockResolvedValue(user);
            userRepository.delete.mockResolvedValue(user);

            const result = await userService.deleteMyAccount("1");

            expect(result).toEqual(user);

            expect(userRepository.findById).toHaveBeenCalledWith("1");
            expect(userRepository.delete).toHaveBeenCalledWith("1");
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(
                userService.deleteMyAccount("1"),
            ).rejects.toBeInstanceOf(ConflictError);

            await expect(
                userService.deleteMyAccount("1"),
            ).rejects.toThrow("user.userNotFound");

            expect(userRepository.delete).not.toHaveBeenCalled();
        });

        it("should throw ConflictError when delete returns null", async () => {
            const user = {
                id: "1",
                fullName: "John Doe",
            };

            userRepository.findById.mockResolvedValue(user);
            userRepository.delete.mockResolvedValue(null);

            await expect(
                userService.deleteMyAccount("1"),
            ).rejects.toBeInstanceOf(ConflictError);

            await expect(
                userService.deleteMyAccount("1"),
            ).rejects.toThrow("user.userNotFound");

            expect(userRepository.delete).toHaveBeenCalledWith("1");
        });
        
        it("should propagate repository delete errors", async () => {
            const user = {
                id: "1",
            };

            userRepository.findById.mockResolvedValue(user);

            userRepository.delete.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                userService.deleteMyAccount("1"),
            ).rejects.toThrow("Database error");

            expect(userRepository.delete).toHaveBeenCalledWith("1");
        });
    });
});