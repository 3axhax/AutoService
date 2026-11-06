import { migrateCompanyThreeMaterialPrices } from './migrations.company-three-material-prices';

describe('company 3 shared material prices', () => {
  function fixture(conflict = false) {
    let completed = false;
    const calls: number[] = [];
    const db = {
      transaction: jest.fn(async (fn) => fn({})),
      query: jest.fn(async (sql, options) => {
        if (sql.includes('SELECT id FROM migrations')) return completed ? [{ id: 1 }] : [];
        if (sql.includes('SELECT id FROM "orderParametersOptions"')) return [{ id: options.replacements.optionId }];
        if (sql.includes('SELECT p.id, p.value')) return conflict ? [{ id: 5, value: 200, discountImpact: true, mainOptionId: 181, conditions: [181] }] : [];
        if (sql.startsWith('INSERT INTO price ')) { calls.push(options.replacements.optionId); return [{ id: 300 + calls.length }]; }
        if (sql.startsWith('INSERT INTO migrations')) completed = true;
        return [];
      }),
    };
    return { db, calls };
  }
  it('inserts both prices once and records completion', async () => {
    const { db, calls } = fixture();
    await migrateCompanyThreeMaterialPrices(db as never);
    await migrateCompanyThreeMaterialPrices(db as never);
    expect(calls).toEqual([181, 182]);
    expect(db.query.mock.calls.filter(([sql]) => sql.startsWith('INSERT INTO "priceParametersOptionConditions"'))).toHaveLength(2);
  });
  it('rejects a conflicting price', async () => {
    const { db, calls } = fixture(true);
    await expect(migrateCompanyThreeMaterialPrices(db as never)).rejects.toThrow('Unexpected existing material price');
    expect(calls).toEqual([]);
  });
});
