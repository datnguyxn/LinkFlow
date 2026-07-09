import type { User } from "@prisma/client";
import { DEFAULT_AVATAR_URL } from "../constants/default-avatar.constant.ts";
/**
 * UserSerializer is responsible for transforming user data into a format suitable for API responses.
 * It ensures that only relevant fields are exposed to the client.
 */
export class UserSerializer {

    /**
     * Serialize a single user object into a response-friendly format.
     * @param user - The user object to serialize
     * @returns An object containing the serialized user data
     */
    static serialize(user: User) {
        return {
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl ?? DEFAULT_AVATAR_URL,
            status: user.status,
            emailVerified: user.emailVerified,
            language: user.language,
            timezone: user.timezone
        };
    }

    /**
     * Serialize an array of user objects into a response-friendly format.
     * @param users - An array of user objects to serialize
     * @returns An array of serialized user data
     */
    static serializeMany(users: User[]) {
        return users.map(this.serialize);
    }
}