import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let user_id: string;

describe('Create Statement', () => {
  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    const user = await usersRepositoryInMemory.create({
      name: 'test',
      email: 'test@email.com',
      password: 'password',
    });
    user_id = user.id as string;
  });

  it('should be able to create an deposit statement', async () => {
    const statement = await createStatementUseCase.execute({
      user_id,
      type: 'deposit' as OperationType,
      amount: 80,
      description: 'test'
    });

    expect(statement).toHaveProperty('id');
  });

  it('should be able to create an withdraw statement', async () => {
    await createStatementUseCase.execute({
      user_id,
      type: 'deposit' as OperationType,
      amount: 80,
      description: 'test'
    });

    const statement = await createStatementUseCase.execute({
      user_id,
      type: 'withdraw' as OperationType,
      amount: 50,
      description: 'test'
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create an statement if user not exists', async () => {
    expect.assertions(1);

    try {
      await createStatementUseCase.execute({
        user_id: 'user-not-existent',
        type: 'deposit' as OperationType,
        amount: 80,
        description: 'test'
      });
    } catch (e) {
      expect(e).toBeInstanceOf(CreateStatementError.UserNotFound);
    }
  });

  it('should not be able to create an withdraw statement if user have insufficient funds', async () => {
    expect.assertions(1);

    try {
      await createStatementUseCase.execute({
        user_id,
        type: 'withdraw' as OperationType,
        amount: 80,
        description: 'test'
      });
    } catch (e) {
      expect(e).toBeInstanceOf(CreateStatementError.InsufficientFunds);
    }
  });
});
