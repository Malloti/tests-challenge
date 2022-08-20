import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from "typeorm";

import { app } from '../../../../app';
import { User } from '../../../users/entities/User';

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = connection.getRepository(User);
    const user = usersRepository.create({
      name: 'test',
      email: 'createstatementest@email.com',
      password: await hash('password', 8)
    });

    await usersRepository.save(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create an deposit statement', async () => {
    const auth = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'createstatementest@email.com',
      password: 'password',
    });

    const { token } = auth.body;

    const response = await request(app)
      .post(`/api/v1/statements/deposit`)
      .set('Authorization', `jwt ${token}`)
      .send({
        amount: 80,
        description: 'test'
      });

    expect(response.status).toBe(201);
  });

  it('should be able to create an withdraw statement', async () => {
    const auth = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'createstatementest@email.com',
      password: 'password',
    });

    const { token } = auth.body;

    const response = await request(app)
      .post(`/api/v1/statements/withdraw`)
      .set('Authorization', `jwt ${token}`)
      .send({
        amount: 80,
        description: 'test'
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create an statement for a non auth user', async () => {
    const response = await request(app)
      .post(`/api/v1/statements/deposit`)
      .send({
        amount: 80,
        description: 'test'
      });

    expect(response.status).toBe(401);
  });
});
