import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/** Configure the four supported discount choices for company 3. */
export async function migrateCompanyThreeDiscounts(sequelize: Sequelize) {
  const name = 'company_three_discount_options_0_10_15_20';
  await sequelize.transaction(async (transaction) => {
    await sequelize.query('SELECT pg_advisory_xact_lock(309001)', {
      transaction,
    });
    const completed = await sequelize.query(
      'SELECT id FROM migrations WHERE name = :name',
      { replacements: { name }, type: QueryTypes.SELECT, transaction },
    );
    if (completed.length) return;
    const settings = await sequelize.query<{
      id: number;
      parametersList: string;
      optionsList: string;
    }>(
      'SELECT id, "parametersList", "optionsList" FROM "companiesParametersOptions" WHERE "companyId" = 3 FOR UPDATE',
      { type: QueryTypes.SELECT, transaction },
    );
    if (settings.length !== 1)
      throw new Error('Expected one settings row for company 3');
    const parse = (text: string) =>
      (text || '')
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
    if (!parse(settings[0].parametersList).includes(12))
      throw new Error('Discount parameter is not enabled for company 3');
    const discounts = await sequelize.query<{
      id: number;
      translationRu: string;
    }>(
      'SELECT id, "translationRu" FROM "orderParametersOptions" WHERE "parametersId" = 12 ORDER BY id FOR UPDATE',
      { type: QueryTypes.SELECT, transaction },
    );
    const selectedIds: number[] = [];
    for (const label of ['0%', '10%', '15%', '20%']) {
      const matches = discounts.filter((item) => item.translationRu === label);
      if (matches.length > 1)
        throw new Error(`Duplicate discount option ${label}`);
      if (matches.length === 1) selectedIds.push(matches[0].id);
      else if (label === '0%' || label === '10%')
        throw new Error(`Required discount option ${label} is missing`);
      else {
        const [created] = await sequelize.query<{ id: number }>(
          'INSERT INTO "orderParametersOptions" ("parametersId", "translationRu", "createdAt", "updatedAt") VALUES (12, :label, NOW(), NOW()) RETURNING id',
          { replacements: { label }, type: QueryTypes.SELECT, transaction },
        );
        selectedIds.push(created.id);
      }
    }
    const discountIds = new Set(discounts.map((item) => item.id));
    const otherIds = parse(settings[0].optionsList).filter(
      (id) => !discountIds.has(id),
    );
    const next = [...new Set([...otherIds, ...selectedIds])];
    await sequelize.query(
      'UPDATE "companiesParametersOptions" SET "optionsList" = :options, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: { options: next.join(','), id: settings[0].id },
        transaction,
      },
    );
    await sequelize.query('INSERT INTO migrations (name) VALUES (:name)', {
      replacements: { name },
      transaction,
    });
  });
}
