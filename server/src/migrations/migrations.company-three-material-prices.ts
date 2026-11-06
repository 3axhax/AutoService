import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/** Add the shared package and copper grease prices for company 3. */
export async function migrateCompanyThreeMaterialPrices(sequelize: Sequelize) {
  const name = 'company_three_shared_material_prices';
  await sequelize.transaction(async (transaction) => {
    await sequelize.query('SELECT pg_advisory_xact_lock(309012)', { transaction });
    const done = await sequelize.query('SELECT id FROM migrations WHERE name = :name', {
      replacements: { name }, type: QueryTypes.SELECT, transaction,
    });
    if (done.length) return;
    for (const optionId of [181, 182]) {
      const options = await sequelize.query<{ id: number }>(
        'SELECT id FROM "orderParametersOptions" WHERE id = :optionId AND "parametersId" = 9',
        { replacements: { optionId }, type: QueryTypes.SELECT, transaction },
      );
      if (options.length !== 1) throw new Error(`Missing material option ${optionId}`);
      const existing = await sequelize.query<{ id: number; value: number; discountImpact: boolean; mainOptionId: number; conditions: number[] }>(
        'SELECT p.id, p.value, p."discountImpact", p."mainOptionId", ARRAY(SELECT x."optionId" FROM "priceParametersOptionConditions" x WHERE x."priceId"=p.id ORDER BY x."optionId") AS conditions FROM price p LEFT JOIN "priceParametersOptionConditions" c ON c."priceId" = p.id WHERE p."companyId" = 3 AND (p."mainOptionId" = :optionId OR c."optionId" = :optionId)',
        { replacements: { optionId }, type: QueryTypes.SELECT, transaction },
      );
      if (existing.length) {
        const match = existing.length === 1 && existing[0].value === 100 && existing[0].discountImpact && existing[0].mainOptionId === optionId && existing[0].conditions.length === 1 && existing[0].conditions[0] === optionId;
        if (!match) throw new Error(`Unexpected existing material price ${optionId}`);
        continue;
      }
      const [price] = await sequelize.query<{ id: number }>(
        'INSERT INTO price ("companyId", value, "discountImpact", "mainOptionId", "createdAt", "updatedAt") VALUES (3, 100, true, :optionId, NOW(), NOW()) RETURNING id',
        { replacements: { optionId }, type: QueryTypes.SELECT, transaction },
      );
      await sequelize.query(
        'INSERT INTO "priceParametersOptionConditions" ("priceId", "optionId") VALUES (:priceId, :optionId)',
        { replacements: { priceId: price.id, optionId }, transaction },
      );
    }
    await sequelize.query('INSERT INTO migrations (name) VALUES (:name)', {
      replacements: { name }, transaction,
    });
  });
}
