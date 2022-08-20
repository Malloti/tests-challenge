import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from "typeorm";

import { app } from '../../../../app';
import { User } from '../../entities/User';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = connection.getRepository(User);
    const user = usersRepository.create({
      name: 'test',
      email: 'showusertest@email.com',
      password: await hash('password', 8)
    });

    await usersRepository.save(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list a user', async () => {
    const auth = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'showusertest@email.com',
      password: 'password',
    });

    const { token } = auth.body;

    const response = await request(app).get(`/api/v1/profile/`).set('Authorization', `jwt ${token}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to list an user without token', async () => {
    const response = await request(app).get(`/api/v1/profile/`);

    expect(response.status).toBe(401);
  });
});
