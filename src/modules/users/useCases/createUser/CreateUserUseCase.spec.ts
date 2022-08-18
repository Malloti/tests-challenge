import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";

import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User Use Case', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@email.com',
      password: 'password',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create a user when email already exists', async () => {
    expect.assertions(1);
    try {
      await createUserUseCase.execute({
        name: '1',
        email: 'test@email.com',
        password: 'password',
      });

      await createUserUseCase.execute({
        name: '2',
        email: 'test@email.com',
        password: 'password',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(CreateUserError);
    }
  });
});
