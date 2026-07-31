import type { FastifyInstance } from 'fastify';

export async function loginTestUser(app: FastifyInstance, email: string, password: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email,
      password,
      rememberMe: false,
    },
  });

  if (response.statusCode !== 200) {
    console.log(response.body);

    throw new Error('Login failed');
  }

  const body = response.json();

  return body.data.accessToken;
}
