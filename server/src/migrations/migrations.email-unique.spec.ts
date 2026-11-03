import {
  applyEmailUniqueness,
  EMAIL_UNIQUE_INDEX_SQL,
} from './migrations.email-unique';
describe('prepared email migration (not applied to live database)', () => {
  const fixture = (count: string) => {
    const transaction = {};
    const sequelize = {
      transaction: jest.fn((callback) => callback(transaction)),
      query: jest.fn(async (sql) =>
        sql.includes('SELECT COUNT') ? [{ count }] : [],
      ),
    };
    return { sequelize, transaction };
  };
  it('is repeatable and records the migration in the same transaction', async () => {
    const { sequelize, transaction } = fixture('0');
    await applyEmailUniqueness(sequelize as never);
    await applyEmailUniqueness(sequelize as never);
    expect(sequelize.query).toHaveBeenCalledWith(EMAIL_UNIQUE_INDEX_SQL, {
      transaction,
    });
    expect(EMAIL_UNIQUE_INDEX_SQL).toContain('UNIQUE INDEX IF NOT EXISTS');
    expect(EMAIL_UNIQUE_INDEX_SQL).toContain('lower(btrim(email))');
    expect(
      sequelize.query.mock.calls
        .filter(([sql]) => sql.includes('INSERT INTO migrations'))
        .every(
          ([, options]) =>
            (options as { transaction: unknown }).transaction === transaction,
        ),
    ).toBe(true);
  });
  it('stops before index creation when duplicates exist, without modifying identities', async () => {
    const { sequelize } = fixture('1');
    await expect(applyEmailUniqueness(sequelize as never)).rejects.toThrow(
      'Email duplicates',
    );
    expect(
      sequelize.query.mock.calls.some(
        ([sql]) => sql.startsWith('CREATE') || sql.startsWith('INSERT'),
      ),
    ).toBe(false);
  });
});
