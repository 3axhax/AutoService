import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export async function migrateCompanyThreeRepair(sequelize: Sequelize) {
  const name = 'company_three_repair_work_material_dependencies';
  await sequelize.transaction(async (transaction) => {
    await sequelize.query('SELECT pg_advisory_xact_lock(308003)', {
      transaction,
    });
    const done = await sequelize.query(
      'SELECT id FROM migrations WHERE name = :name',
      { replacements: { name }, type: QueryTypes.SELECT, transaction },
    );
    if (done.length) return;
    const shared = await sequelize.query(
      'SELECT id FROM "companiesParametersOptions" WHERE "companyId" <> 3 AND string_to_array("optionsList", \',\')::integer[] && ARRAY(SELECT generate_series(212,229))',
      { type: QueryTypes.SELECT, transaction },
    );
    if (shared.length)
      throw new Error('Repair options are also used by another company');
    const rows = await sequelize.query<{
      id: number;
      optionOptionDependence: string;
      optionsList: string;
    }>(
      'SELECT id, "optionOptionDependence", "optionsList" FROM "companiesParametersOptions" WHERE "companyId" = 3 FOR UPDATE',
      { type: QueryTypes.SELECT, transaction },
    );
    if (rows.length !== 1) throw new Error('Expected company 3 settings');
    const opts = await sequelize.query<{ id: number; parametersId: number }>(
      'SELECT id, "parametersId" FROM "orderParametersOptions" WHERE id IN (179, 180) OR id BETWEEN 212 AND 229 ORDER BY id FOR UPDATE',
      { type: QueryTypes.SELECT, transaction },
    );
    if (
      opts.length !== 20 ||
      opts.some(
        (o) =>
          (o.id <= 180 && o.parametersId !== 15) ||
          (o.id >= 212 && o.id <= 224 && o.parametersId !== 9) ||
          (o.id >= 225 && o.parametersId !== 8),
      )
    )
      throw new Error('Unexpected repair option configuration');
    const companyIds = new Set(rows[0].optionsList.split(',').map(Number));
    if (opts.some((o) => !companyIds.has(o.id)))
      throw new Error('Company 3 is missing repair options');
    const priced = await sequelize.query<{
      mainOptionId: number;
      optionId: number;
    }>(
      `SELECT p."mainOptionId", c."optionId" FROM price p JOIN "priceParametersOptionConditions" c ON c."priceId" = p.id WHERE p."companyId" = 3 AND p."mainOptionId" IN (179,180) AND c."optionId" BETWEEN 185 AND 211 ORDER BY 1,2`,
      { type: QueryTypes.SELECT, transaction },
    );
    const mapping: Record<number, number[]> = {
      179: [
        ...new Set(
          priced.filter((p) => p.mainOptionId === 179).map((p) => p.optionId),
        ),
      ],
      180: [
        ...new Set(
          priced.filter((p) => p.mainOptionId === 180).map((p) => p.optionId),
        ),
      ],
      225: [212, 213, 214],
      226: [215, 216],
      227: [217, 218],
      228: [219, 221, 223],
      229: [220, 222, 224],
    };
    if (mapping[179].length !== 27 || mapping[180].length !== 10)
      throw new Error('Unexpected vulcanization price conditions');
    const dependence = JSON.parse(
      rows[0].optionOptionDependence || '{}',
    ) as Record<string, Record<string, number[]>>;
    if (dependence['12']?.['8'])
      dependence['12']['8'] = dependence['12']['8'].filter(
        (id) => id < 225 || id > 229,
      );
    for (const [work, materials] of Object.entries(mapping))
      dependence[work] = { ...(dependence[work] ?? {}), '15': materials };
    await sequelize.query(
      'UPDATE "companiesParametersOptions" SET "optionOptionDependence" = :value, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: { value: JSON.stringify(dependence), id: rows[0].id },
        transaction,
      },
    );
    await sequelize.query(
      `UPDATE "orderParametersOptions" SET "parametersId"=15, "optionGroup"='material', "optionGroupTranslationRu"='Материал', "optionGroupOrder"=2, "updatedAt"=NOW() WHERE id BETWEEN 185 AND 211 OR id BETWEEN 212 AND 224`,
      { transaction },
    );
    await sequelize.query(
      `UPDATE "orderParametersOptions" SET "parametersId"=15, "optionGroup"='work_method', "optionGroupTranslationRu"='Работы', "optionGroupOrder"=1, "updatedAt"=NOW() WHERE id IN (179,180,225,226,227,228,229)`,
      { transaction },
    );
    await sequelize.query('INSERT INTO migrations (name) VALUES (:name)', {
      replacements: { name },
      transaction,
    });
  });
}
