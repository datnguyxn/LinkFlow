import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';

import { createTestApp } from '../helpers/app';
import { createUser } from '../helpers/factories/user.factory';
import { loginTestUser } from '../helpers/auth';
import { verifyUser } from '../helpers/factories/verify-user.factory';

describe('Create Workspace', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should create workspace', async () => {

        const { user, password } = await createUser();
        await verifyUser(user.email);
        const token = await loginTestUser(app, user.email, password);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v1/workspaces',
            headers: {
                authorization: `Bearer ${token}`,
            },
            payload: {
                name: 'My Workspace',
            },
        });

        expect(response.statusCode).toBe(201);
    });
});