import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

async function setUp(statementsRepository: IStatementsRepository, usersRepository: IUsersRepository) {
  const createUserUseCase = new CreateUserUseCase(usersRepository);
  const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

  const user = await createUserUseCase.execute({
    name: 'test',
    email: 'test@email.com',
    password: 'password',
  });

  user_id = user.id as string;

  createStatementUseCase.execute({
    user_id: user.id as string,
    type: 'deposit' as OperationType,
    amount: 80,
    description: 'testing',
  });
}

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let user_id: string;

describe('Get Balance', () => {
  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    await setUp(statementsRepositoryInMemory, usersRepositoryInMemory);
  });

  it('should be able to list users balance by user id', async () => {
    const response = await getBalanceUseCase.execute({ user_id });

    expect(response).toHaveProperty('balance');
    expect(response.balance).toEqual(80);
  });

  it('should not be able to list users balance if user not exists', async () => {
    expect.assertions(1);

    try {
      await getBalanceUseCase.execute({ user_id: 'id-exists-12151' });
    } catch (e) {
      expect(e).toBeInstanceOf(GetBalanceError);
    }
  });
});
