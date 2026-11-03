import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { RolesService } from '../roles/roles.service';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('synthetic-hash'),
}));
const dto = {
  email: 'SAME@example.test',
  name: 'Test',
  companyName: 'Test company',
  password: 'synthetic-password',
  confirmedPassword: 'synthetic-password',
};
function fixture() {
  const state = {
    companies: [] as unknown[],
    users: [] as any[],
    roles: [] as unknown[],
    sessions: [] as unknown[],
  };
  let failure: string | undefined,
    tail = Promise.resolve(),
    currentEmail = '';
  const sequelize = {
    transaction: async (callback) => {
      let release = () => {},
        snapshot: Record<string, number> = {};
      const transaction = {
        capture: () => {
          snapshot = Object.fromEntries(
            Object.entries(state).map(([key, rows]) => [key, rows.length]),
          );
        },
        setRelease: (fn) => {
          release = fn;
        },
      };
      try {
        return await callback(transaction);
      } catch (error) {
        for (const key of Object.keys(snapshot))
          state[key].length = snapshot[key];
        throw error;
      } finally {
        release();
      }
    },
    query: jest.fn(async (sql, options) => {
      expect(sql).toContain('pg_advisory_xact_lock');
      const previous = tail;
      let unlock = () => {};
      tail = new Promise<void>((resolve) => {
        unlock = resolve;
      });
      await previous;
      currentEmail = options.replacements.email;
      options.transaction.capture();
      options.transaction.setRelease(unlock);
    }),
  };
  const transactionRequired = (options) => {
    expect(options.transaction).toBeDefined();
  };
  const userRepository = {
    sequelize,
    findOne: jest.fn(async (options) => {
      transactionRequired(options);
      return options.where.id
        ? state.users.find((user) => user.id === options.where.id)
        : (state.users.find((user) => user.email === currentEmail) ?? null);
    }),
    create: jest.fn(async (data, options) => {
      transactionRequired(options);
      const row = {
        ...data,
        id: state.users.length + 1,
        roles: [],
        get: () => ({ roles: row.roles }),
        $set: async (_, roles, opts) => {
          transactionRequired(opts);
          state.roles.push(roles);
          if (failure === 'roles') throw new Error('synthetic roles failure');
        },
      };
      state.users.push(row);
      if (failure === 'user') throw new Error('synthetic user failure');
      return row;
    }),
  };
  const sessions = new UsersSessionsService({
    create: async (data, options) => {
      transactionRequired(options);
      state.sessions.push(data);
      if (failure === 'session') throw new Error('synthetic session failure');
      return data;
    },
  } as never);
  const roles = new RolesService({
    findOne: async (options) => {
      transactionRequired(options);
      return { id: 1, value: 'ADMIN' };
    },
  } as never);
  const users = new UsersService(userRepository as never, roles, sessions);
  const companies = new CompaniesService({
    create: async (data, options) => {
      transactionRequired(options);
      state.companies.push(data);
      if (failure === 'company') throw new Error('synthetic company failure');
      return { id: state.companies.length };
    },
  } as never);
  return {
    service: new AuthService(users, sessions, companies),
    state,
    userRepository,
    sequelize,
    fail: (stage?: string) => {
      failure = stage;
    },
  };
}
describe('atomic concurrent registration', () => {
  it('serializes equivalent email addresses and creates only one identity', async () => {
    const f = fixture();
    const result = await Promise.allSettled([
      f.service.register(dto),
      f.service.register({ ...dto, email: ' same@EXAMPLE.test ' }),
    ]);
    expect(result.filter((item) => item.status === 'fulfilled')).toHaveLength(
      1,
    );
    const rejected = result.find(
      (item) => item.status === 'rejected',
    ) as PromiseRejectedResult;
    expect(rejected.reason.status).toBe(409);
    expect(f.state.users).toHaveLength(1);
    expect(f.state.companies).toHaveLength(1);
    expect(f.state.sessions).toHaveLength(1);
    expect(f.state.users[0].email).toBe('same@example.test');
    expect(
      f.sequelize.query.mock.calls.every(
        ([, options]) => options.replacements.email === 'same@example.test',
      ),
    ).toBe(true);
  });
  it.each(['company', 'user', 'roles', 'session'])(
    'rolls back all records on %s failure and permits a clean retry',
    async (stage) => {
      const f = fixture();
      f.fail(stage);
      await expect(f.service.register(dto)).rejects.toMatchObject({
        status: 400,
      });
      expect(Object.values(f.state).every((rows) => rows.length === 0)).toBe(
        true,
      );
      f.fail();
      await expect(f.service.register(dto)).resolves.toMatchObject({
        roles: ['ADMIN'],
      });
      expect(Object.values(f.state).every((rows) => rows.length === 1)).toBe(
        true,
      );
    },
  );
});
