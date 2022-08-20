import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from "typeorm";

import { app } from '../../../../app';
import { User } from '../../../users/entities/User';
import { Statement } from '../../entities/Statement';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = connection.getRepository(User);
    const user = usersRepository.create({
      name: 'test',
      email: 'getbalancetest@email.com',
      password: await hash('password', 8)
    });

    await usersRepository.save(user);

    const statementsRepository = connection.getRepository(Statement);
    const statement = statementsRepository.create({
      user_id: user.id,
      type: 'deposit',
      amount: 80,
      description: 'test'
    } as Statement);

    await statementsRepository.save(statement);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list users balance by auth token', async () => {
    const auth = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'getbalancetest@email.com',
      password: 'password',
    });

    const { token } = auth.body;

    const response = await request(app).get(`/api/v1/statements/balance`).set('Authorization', `jwt ${token}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to list users balance without auth', async () => {
    const response = await request(app).get(`/api/v1/statements/balance`);

    expect(response.status).toBe(401);
  });
});
