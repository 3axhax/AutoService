import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

// Applied once after reference data has been seeded.
export async function migrateCompanyThreeTruckPrices(sequelize: Sequelize) {
  const name = 'company_three_truck_prices_by_subtype';
  await sequelize.transaction(async (transaction) => {
    await sequelize.query('SELECT pg_advisory_xact_lock(308001)', {
      transaction,
    });
    const done = await sequelize.query(
      'SELECT id FROM migrations WHERE name = :name',
      { replacements: { name }, type: QueryTypes.SELECT, transaction },
    );
    if (done.length) return;
    const settings = await sequelize.query<{
      id: number;
      parameterOptionDependence: string;
    }>(
      'SELECT id, "parameterOptionDependence" FROM "companiesParametersOptions" WHERE "companyId" = 3 FOR UPDATE',
      { type: QueryTypes.SELECT, transaction },
    );
    if (settings.length !== 1)
      throw new Error('Expected one settings row for company 3');
    const dependencies = JSON.parse(
      settings[0].parameterOptionDependence || '{}',
    );
    dependencies['7'] = [13];
    await sequelize.query(
      'UPDATE "companiesParametersOptions" SET "parameterOptionDependence" = :dependencies, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: {
          dependencies: JSON.stringify(dependencies),
          id: settings[0].id,
        },
        transaction,
      },
    );
    const subtype = await sequelize.query(
      'UPDATE "orderParametersOptions" SET "translationRu" = :name, "updatedAt" = NOW() WHERE id = 115 AND "parametersId" = 6 RETURNING id',
      {
        replacements: {
          name: 'R15–R17,5 ПАЗ, ГАЗ, ЗИЛ, МКСМ с кольцами и без колец',
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );
    if (subtype.length !== 1) throw new Error('Truck subtype 115 is missing');
    const prices = await sequelize.query<{
      id: number;
      value: number;
      discountImpact: boolean;
      mainOptionId: number;
    }>(
      `SELECT p.id, p.value, p."discountImpact", p."mainOptionId" FROM price p WHERE p."companyId" = 3 AND p."mainOptionId" BETWEEN 158 AND 178 AND EXISTS (SELECT 1 FROM "priceParametersOptionConditions" c WHERE c."priceId" = p.id AND c."optionId" = 12) FOR UPDATE`,
      { type: QueryTypes.SELECT, transaction },
    );
    if (prices.length !== 12)
      throw new Error(
        `Expected 12 shared truck prices, found ${prices.length}`,
      );
    for (const price of prices) {
      const conditions = await sequelize.query<{ optionId: number }>(
        'SELECT "optionId" FROM "priceParametersOptionConditions" WHERE "priceId" = :id',
        {
          replacements: { id: price.id },
          type: QueryTypes.SELECT,
          transaction,
        },
      );
      if (conditions.some(({ optionId }) => optionId >= 115 && optionId <= 119))
        throw new Error(
          `Price ${price.id} already has a truck subtype condition`,
        );
      const collisions = await sequelize.query(
        `SELECT p.id FROM price p JOIN "priceParametersOptionConditions" c ON c."priceId" = p.id WHERE p."companyId" = 3 AND p."mainOptionId" = :mainOptionId AND c."optionId" BETWEEN 115 AND 119 LIMIT 1`,
        {
          replacements: { mainOptionId: price.mainOptionId },
          type: QueryTypes.SELECT,
          transaction,
        },
      );
      if (collisions.length)
        throw new Error(
          `Subtype prices already exist for option ${price.mainOptionId}`,
        );
      for (const subtypeId of [115, 116, 117, 118, 119]) {
        const [created] = await sequelize.query<{ id: number }>(
          `INSERT INTO price ("companyId", value, "discountImpact", "mainOptionId", "createdAt", "updatedAt") VALUES (3, :value, :discountImpact, :mainOptionId, NOW(), NOW()) RETURNING id`,
          {
            replacements: {
              value: price.value,
              discountImpact: price.discountImpact,
              mainOptionId: price.mainOptionId,
            },
            type: QueryTypes.SELECT,
            transaction,
          },
        );
        for (const optionId of [
          ...conditions.map((c) => c.optionId).filter((id) => id !== 12),
          subtypeId,
        ]) {
          await sequelize.query(
            'INSERT INTO "priceParametersOptionConditions" ("priceId", "optionId") VALUES (:priceId, :optionId)',
            { replacements: { priceId: created.id, optionId }, transaction },
          );
        }
      }
      await sequelize.query('DELETE FROM price WHERE id = :id', {
        replacements: { id: price.id },
        transaction,
      });
    }
    await sequelize.query('INSERT INTO migrations (name) VALUES (:name)', {
      replacements: { name },
      transaction,
    });
  });
}
