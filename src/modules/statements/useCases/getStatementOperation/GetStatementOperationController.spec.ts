import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import { User } from '../../../users/entities/User';
import { Statement } from '../../entities/Statement';

let connection: Connection;
let statement_id: string;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = connection.getRepository(User);
    const user = usersRepository.create({
      name: 'test',
      email: 'getstatementoperationtest@email.com',
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

    statement_id = statement.id!;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list an statement', async () => {
    const auth = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'getstatementoperationtest@email.com',
      password: 'password',
    });

    const { token } = auth.body;

    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set('Authorization', `jwt ${token}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to list an non existing statement', async () => {
    const auth = await request(app).post('/api/v1/sessions').send({
      name: 'test',
      email: 'getstatementoperationtest@email.com',
      password: 'password',
    });

    const { token } = auth.body;

    const nonExistentId = uuidV4();

    const response = await request(app).get(`/api/v1/statements/${nonExistentId}`).set('Authorization', `jwt ${token}`);

    expect(response.status).toBe(404);
  });

  it('should not be able to list an statement without auth', async () => {
    const response = await request(app).get(`/api/v1/statements/${statement_id}`);

    expect(response.status).toBe(401);
  });
});
