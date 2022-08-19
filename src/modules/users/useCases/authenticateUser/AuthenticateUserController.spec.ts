import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from "typeorm";
import { app } from '../../../../app';
import { User } from '../../entities/User';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = connection.getRepository(User);
    const user = usersRepository.create({
      name: 'test',
      email: 'test@email.com',
      password: await hash('password', 8)
    });

    await usersRepository.save(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'test@email.com',
      password: 'password',
    });

    expect(response.status).toBe(200);
  });

  it('should not be able to authenticate an user if email not exists', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'not@exists.com',
      password: 'password',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate an user with incorrect password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'test@email.com',
      password: 'incorrect',
    });

    expect(response.status).toBe(401);
  });
});
