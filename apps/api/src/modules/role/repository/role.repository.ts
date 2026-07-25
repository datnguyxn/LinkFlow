import { prisma } from '../../../infrastructure/database/index.ts';

/**
 * RoleRepository class provides methods to interact with the role data in the database.
 * It includes methods for finding roles by their unique ID.
 */
export class RoleRepository {
  /**
   * Find a role by its unique ID
   * @param id - The unique identifier of the role to find
   * @returns The role object if found, otherwise null
   */
  async findById(id: string) {
    // Use Prisma to find a unique role record by its ID
    return prisma.role.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Find a role by its name
   * @param name - The name of the role to find
   * @returns The role object if found, otherwise null
   */
  async findByName(name: string) {
    // Use Prisma to find a unique role record by its name
    return prisma.role.findUnique({
      where: {
        name,
      },
    });
  }
}
