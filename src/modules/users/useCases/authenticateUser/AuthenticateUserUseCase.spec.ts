import { hash } from 'bcryptjs';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to authenticate an user', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'test',
      email: 'test@finapi.com',
      password: await hash('test', 8),
    });

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: 'test'
    });

    expect(auth).toHaveProperty('user');
    expect(auth).toHaveProperty('token');
    expect(auth.user).toHaveProperty('id');
  });


  it('should not be able to authenticate an user if not exists', async () => {
    expect.assertions(1);

    try {
      await authenticateUserUseCase.execute({
        email: 'not@exists.com',
        password: 'not'
      });
    } catch (e) {
      expect(e).toBeInstanceOf(IncorrectEmailOrPasswordError)
    }
  });


  it('should not be able to authenticate an user with incorrect password', async () => {
    expect.assertions(1);

    const user = await usersRepositoryInMemory.create({
      name: 'test',
      email: 'test@finapi.com',
      password: 'test',
    });

    try {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrect'
      });
    } catch (e) {
      expect(e).toBeInstanceOf(IncorrectEmailOrPasswordError)
    }
  });
});
