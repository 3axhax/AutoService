import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/** Copy company 1 payment choices without changing any other company settings. */
export async function migrateCompanyThreePayment(sequelize: Sequelize) {
  const name = 'company_three_payment_options';
  await sequelize.transaction(async (transaction) => {
    await sequelize.query('SELECT pg_advisory_xact_lock(308002)', {
      transaction,
    });
    const done = await sequelize.query(
      'SELECT id FROM migrations WHERE name = :name',
      { replacements: { name }, type: QueryTypes.SELECT, transaction },
    );
    if (done.length) return;
    const settings = await sequelize.query<{
      id: number;
      companyId: number;
      parametersList: string;
      optionsList: string;
    }>(
      'SELECT id, "companyId", "parametersList", "optionsList" FROM "companiesParametersOptions" WHERE "companyId" IN (1, 3) ORDER BY "companyId" FOR UPDATE',
      { type: QueryTypes.SELECT, transaction },
    );
    if (
      settings.length !== 2 ||
      settings[0].companyId !== 1 ||
      settings[1].companyId !== 3
    )
      throw new Error('Expected one settings row each for companies 1 and 3');
    const parseIds = (value: string) =>
      value
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
    if (
      !settings.every((row) => parseIds(row.parametersList || '').includes(13))
    )
      throw new Error('Payment parameter is not enabled for both companies');
    const sourceIds = parseIds(settings[0].optionsList || '');
    const available = await sequelize.query<{ id: number }>(
      'SELECT id FROM "orderParametersOptions" WHERE "parametersId" = 13 AND id IN (:sourceIds) ORDER BY id',
      {
        replacements: { sourceIds: sourceIds.length ? sourceIds : [-1] },
        type: QueryTypes.SELECT,
        transaction,
      },
    );
    if (!available.length) throw new Error('Company 1 has no payment options');
    const targetIds = parseIds(settings[1].optionsList || '');
    const next = [
      ...new Set([...targetIds, ...available.map((item) => item.id)]),
    ];
    await sequelize.query(
      'UPDATE "companiesParametersOptions" SET "optionsList" = :options, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: { options: next.join(','), id: settings[1].id },
        transaction,
      },
    );
    await sequelize.query('INSERT INTO migrations (name) VALUES (:name)', {
      replacements: { name },
      transaction,
    });
  });
}
