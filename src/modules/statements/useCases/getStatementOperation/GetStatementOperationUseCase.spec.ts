import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user_id: string;
let statement_id: string;

describe('Get Statement Operation', () => {
  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    const user = await usersRepositoryInMemory.create({
      name: 'test',
      email: 'test@email.com',
      password: 'password',
    });

    user_id = user.id!;

    const statement = await statementsRepositoryInMemory.create({
      user_id,
      type: 'deposit' as OperationType,
      amount: 80,
      description: 'test'
    });

    statement_id = statement.id!;
  });

  it('should be able to list an statement', async () => {
    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to list an statement if user not exists', async () => {
    expect.assertions(1);

    try {
      await getStatementOperationUseCase.execute({
        user_id: 'non-existing',
        statement_id,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(GetStatementOperationError.UserNotFound);
    }
  });

  it('should not be able to list an statement if not exists', async () => {
    expect.assertions(1);

    try {
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'non-existing',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    }
  });
});
