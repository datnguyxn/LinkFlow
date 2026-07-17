import type { User } from '@prisma/client';

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
  static serialize(user: User, provider: string) {
    return {
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      emailVerified: user.emailVerified,
      language: user.language,
      timezone: user.timezone,
      createdAt: user.createdAt,
      theme: user.theme,
      provider: provider,
    };
  }

  /**
   * Serialize an array of user objects into a response-friendly format.
   * @param users - An array of user objects to serialize
   * @returns An array of serialized user data
   */
  static serializeMany(users: User[], provider: string) {
    return users.map((user) => this.serialize(user, provider));
  }
}
