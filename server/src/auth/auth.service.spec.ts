import { AuthService } from './auth.service';
import { UserRoleEnum } from '../roles/roles.types';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('test-hash'),
}));

const dto = {
  email: 'registration@example.test',
  name: 'Test user',
  companyName: 'Test company',
  password: 'test-password',
  confirmedPassword: 'test-password',
};

describe('AuthService registration', () => {
  const setup = () => {
    const users = {
      getUserByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({
        id: 8,
        name: dto.name,
        get: () => ({ roles: [{ value: UserRoleEnum.ADMIN }] }),
      }),
    };
    const companies = {
      createCompany: jest.fn().mockResolvedValue({ id: 77 }),
    };
    const sessions = {
      createSession: jest.fn().mockResolvedValue({ token: 'test-session' }),
    };
    return {
      users,
      companies,
      sessions,
      service: new AuthService(
        users as never,
        sessions as never,
        companies as never,
      ),
    };
  };
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('creates the administrator inside the newly registered company without logging input', async () => {
    const { service, users, companies, sessions } = setup();
    await expect(service.register(dto)).resolves.toEqual({
      id: 8,
      name: dto.name,
      roles: ['ADMIN'],
      token: 'test-session',
    });
    expect(companies.createCompany).toHaveBeenCalledWith({
      fullName: dto.companyName,
    });
    expect(users.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 77,
        email: dto.email,
        password: 'test-hash',
      }),
      UserRoleEnum.ADMIN,
    );
    expect(sessions.createSession).toHaveBeenCalledWith(8);
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns the existing public error without logging sensitive errors', async () => {
    const { service, users } = setup();
    users.createUser.mockRejectedValue(new Error('private DB detail'));
    await expect(service.register(dto)).rejects.toMatchObject({
      status: 400,
      message: 'Ошибка при создании пользователя',
    });
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('rejects an existing email before creating a company', async () => {
    const { service, users, companies } = setup();
    users.getUserByEmail.mockResolvedValue({ id: 1 });
    await expect(service.register(dto)).rejects.toMatchObject({ status: 409 });
    expect(companies.createCompany).not.toHaveBeenCalled();
  });
});
