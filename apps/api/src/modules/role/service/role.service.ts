import { RoleRepository } from '../repository/role.repository.ts';

/**
 * RoleService class provides methods to interact with the role data in the database.
 * It includes methods for retrieving all roles.
 */
export class RoleService {
    // Inject the RoleRepository dependency into the RoleService class
    constructor(private roleRepository: RoleRepository = new RoleRepository()) {}

    /**
     * Get all roles from the database
     * @returns An array of all role objects
     */
    async getAllRoles() {
        // Use the RoleRepository to retrieve all roles from the database
        return this.roleRepository.getAllRoles();
    }
}