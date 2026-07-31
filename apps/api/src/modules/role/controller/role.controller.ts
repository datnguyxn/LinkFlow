import { RoleService } from '../service/role.service.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS } from '../../../common/constants/index.ts';

export class RoleController {
  private roleService: RoleService;
  constructor() {
    this.roleService = new RoleService();
  }

  /**
   * Get all roles from the database
   * Flow:
   * 1. The controller receives a request to get all roles.
   * 2. It calls the RoleService's getAllRoles method to retrieve the roles.
   * 3. The service interacts with the RoleRepository to fetch the data from the database.
   * 4. The controller returns the list of roles as a response.
   * @returns An array of all role objects
   */
  async getAllRoles(request: FastifyRequest, reply: FastifyReply) {
    const response = await this.roleService.getAllRoles();

    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.NOT_FOUND,
        request.t('role.getAllRoles.notFound'),
      );
    }

    return ResponseHandler.success(
      reply,
      response,
      request.t('role.getAllRoles.success'),
      HTTP_STATUS.OK,
    );
  }
}
