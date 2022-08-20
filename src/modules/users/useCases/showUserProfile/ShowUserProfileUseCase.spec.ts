import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";

import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it('should be able to list a user', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'test',
      email: 'test@finapi.com',
      password: 'test',
    });

    const userExists = await showUserProfileUseCase.execute(user.id as string);
    expect(userExists).toEqual(user);
  });

  it('should not be able to list a user if not exists', async () => {
    expect.assertions(1);

    try {
      await showUserProfileUseCase.execute('asccsa4saca454-15assasa-1515151');
    } catch(e) {
      expect(e).toBeInstanceOf(ShowUserProfileError);
    }
  });
});
