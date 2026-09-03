import { Injectable } from '@nestjs/common';
import { QueryTypes, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

const MATERIAL_PRICES: Array<[number, number]> = [
  [183, 450],
  [184, 650],
  [185, 250],
  [186, 300],
  [187, 300],
  [188, 350],
  [189, 350],
  [190, 350],
  [191, 400],
  [192, 450],
  [193, 450],
  [194, 450],
  [195, 550],
  [196, 650],
  [197, 600],
  [198, 800],
  [199, 900],
  [200, 950],
  [201, 1200],
  [202, 1400],
  [203, 1500],
  [204, 300],
  [205, 350],
  [206, 450],
  [207, 500],
  [208, 1200],
  [209, 1700],
  [210, 2300],
  [211, 3000],
  [212, 1000],
  [213, 1300],
  [214, 1500],
  [215, 500],
  [216, 600],
  [217, 200],
  [218, 350],
  [219, 350],
  [220, 200],
  [221, 400],
  [222, 200],
  [223, 450],
  [224, 200],
];

const EXTRA_WORKS: Array<[number, string, number]> = [
  [225, 'Установка камерного вентиля', 450],
  [226, 'Установка бескамерного вентиля', 350],
  [227, 'Установка удлинителя вентиля', 100],
  [228, 'Ремонт грибком', 750],
  [229, 'Ремонт ножкой', 250],
];

const COLD_1000 = [
  185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197,
];
const COLD_1200 = [
  198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211,
];
const HOT_2500 = [198, 199, 200, 201, 202, 203];
const HOT_3500 = [208, 209, 210, 211];

@Injectable()
export class MigrationsPriceTests {
  constructor(private readonly sequelize: Sequelize) {}

  async addCompositeOperationIdColumn() {
    await this.runOnce(
      'add_compositeOperationId_to_ordersOptionValues',
      async (transaction) => {
        await this.sequelize.query(
          `ALTER TABLE "ordersOptionValues"
         ADD COLUMN IF NOT EXISTS "compositeOperationId" VARCHAR(64) NULL`,
          { transaction },
        );
      },
    );
  }

  async addCompanyThreePriceTestCoverage() {
    await this.runOnce(
      'add_company_3_price_test_coverage',
      async (transaction) => {
        for (const [id, translationRu] of EXTRA_WORKS) {
          await this.sequelize.query(
            `INSERT INTO "orderParametersOptions"
             (id, "parametersId", "translationRu", "createdAt", "updatedAt")
           VALUES (:id, 8, :translationRu, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
            { replacements: { id, translationRu }, transaction },
          );
        }

        const [companyOptions] = await this.sequelize.query<{
          id: number;
          optionsList: string;
          optionOptionDependence: string;
        }>(
          `SELECT id, "optionsList", "optionOptionDependence"
         FROM "companiesParametersOptions" WHERE "companyId" = 3 FOR UPDATE`,
          { type: QueryTypes.SELECT, transaction },
        );
        if (!companyOptions) throw new Error('Company 3 options are missing');

        const options = new Set(
          companyOptions.optionsList
            .split(',')
            .map((value) => Number(value.trim())),
        );
        [224, ...EXTRA_WORKS.map(([id]) => id)].forEach((id) =>
          options.add(id),
        );
        const parsedDependence: unknown = JSON.parse(
          companyOptions.optionOptionDependence || '{}',
        ) as unknown;
        const dependence =
          parsedDependence &&
          typeof parsedDependence === 'object' &&
          !Array.isArray(parsedDependence)
            ? (parsedDependence as Record<string, Record<string, number[]>>)
            : {};
        const works = new Set<number>(dependence?.['12']?.['8'] ?? []);
        [180, ...EXTRA_WORKS.map(([id]) => id)].forEach((id) => works.add(id));
        dependence['12'] = dependence['12'] ?? {};
        dependence['12']['8'] = [...works].sort((a, b) => a - b);

        await this.sequelize.query(
          `UPDATE "companiesParametersOptions"
         SET "optionsList" = :optionsList,
             "optionOptionDependence" = :dependence,
             "updatedAt" = NOW()
         WHERE id = :id`,
          {
            replacements: {
              id: companyOptions.id,
              optionsList: [...options]
                .filter(Number.isFinite)
                .sort((a, b) => a - b)
                .join(','),
              dependence: JSON.stringify(dependence),
            },
            transaction,
          },
        );

        for (const [optionId, value] of MATERIAL_PRICES) {
          await this.ensurePrice(optionId, value, [optionId], transaction);
        }
        for (const [optionId, , value] of EXTRA_WORKS) {
          await this.ensurePrice(optionId, value, [optionId], transaction);
        }
        for (const materialId of COLD_1000) {
          await this.ensurePrice(179, 1000, [179, materialId], transaction);
        }
        for (const materialId of COLD_1200) {
          await this.ensurePrice(179, 1200, [179, materialId], transaction);
        }
        for (const materialId of HOT_2500) {
          await this.ensurePrice(180, 2500, [180, materialId], transaction);
        }
        for (const materialId of HOT_3500) {
          await this.ensurePrice(180, 3500, [180, materialId], transaction);
        }

        await this.sequelize.query(
          `SELECT setval('"orderParametersOptions_id_seq"',
          GREATEST((SELECT MAX(id) FROM "orderParametersOptions"), 1), true)`,
          { transaction },
        );
      },
    );
  }

  async makeTireRepairConfigurableParameter() {
    await this.sequelize.query(
      `ALTER TYPE "enum_orderParameters_type"
       ADD VALUE IF NOT EXISTS 'COMPOSITE_LIST'`,
    );

    await this.runOnce(
      'normalize_composite_operation_id_column',
      async (transaction) => {
        await this.sequelize.query(
          `DO $$
           BEGIN
             IF EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ordersOptionValues'
                 AND column_name = 'repairOperationId'
             ) AND NOT EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ordersOptionValues'
                 AND column_name = 'compositeOperationId'
             ) THEN
               ALTER TABLE "ordersOptionValues"
                 RENAME COLUMN "repairOperationId" TO "compositeOperationId";
             ELSIF EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ordersOptionValues'
                 AND column_name = 'repairOperationId'
             ) AND EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ordersOptionValues'
                 AND column_name = 'compositeOperationId'
             ) THEN
               UPDATE "ordersOptionValues"
               SET "compositeOperationId" = COALESCE(
                 "compositeOperationId", "repairOperationId"
               );
               ALTER TABLE "ordersOptionValues"
                 DROP COLUMN "repairOperationId";
             END IF;
           END $$`,
          { transaction },
        );
      },
    );

    await this.runOnce(
      'make_tire_repair_configurable_parameter',
      async (transaction) => {
        await this.sequelize.query(
          `ALTER TABLE "orderParametersOptions"
             ADD COLUMN IF NOT EXISTS "optionGroup" VARCHAR(255) NULL,
             ADD COLUMN IF NOT EXISTS "optionGroupTranslationRu" VARCHAR(255) NULL,
             ADD COLUMN IF NOT EXISTS "optionGroupOrder" INTEGER NULL`,
          { transaction },
        );

        await this.sequelize.query(
          `UPDATE "orderParameters" SET "order" = "order" + 1
           WHERE "order" >= 10`,
          { transaction },
        );
        await this.sequelize.query(
          `INSERT INTO "orderParameters"
             (id, name, type, "translationRu", "order", "createdAt", "updatedAt")
           VALUES (15, 'tire_repair', 'COMPOSITE_LIST', 'Шиноремонт', 10, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             type = EXCLUDED.type,
             "translationRu" = EXCLUDED."translationRu",
             "order" = EXCLUDED."order",
             "updatedAt" = NOW()`,
          { transaction },
        );

        await this.sequelize.query(
          `UPDATE "orderParametersOptions"
           SET "parametersId" = 15,
               "optionGroup" = 'material',
               "optionGroupTranslationRu" = 'Материал',
               "optionGroupOrder" = 1,
               "updatedAt" = NOW()
           WHERE id BETWEEN 185 AND 211`,
          { transaction },
        );
        await this.sequelize.query(
          `UPDATE "orderParametersOptions"
           SET "parametersId" = 15,
               "optionGroup" = 'work_method',
               "optionGroupTranslationRu" = 'Способ работы',
               "optionGroupOrder" = 2,
               "updatedAt" = NOW()
           WHERE id IN (179, 180)`,
          { transaction },
        );

        const [companyOptions] = await this.sequelize.query<{
          id: number;
          parametersList: string;
          optionOptionDependence: string;
        }>(
          `SELECT id, "parametersList", "optionOptionDependence"
           FROM "companiesParametersOptions" WHERE "companyId" = 3 FOR UPDATE`,
          { type: QueryTypes.SELECT, transaction },
        );
        if (!companyOptions) throw new Error('Company 3 options are missing');

        const parameterIds = new Set(
          companyOptions.parametersList
            .split(',')
            .map((value) => Number(value.trim())),
        );
        parameterIds.add(15);
        const parsedDependence: unknown = JSON.parse(
          companyOptions.optionOptionDependence || '{}',
        ) as unknown;
        const dependence =
          parsedDependence &&
          typeof parsedDependence === 'object' &&
          !Array.isArray(parsedDependence)
            ? (parsedDependence as Record<string, Record<string, number[]>>)
            : {};
        if (dependence['12']?.['8']) {
          dependence['12']['8'] = dependence['12']['8'].filter(
            (id) => ![179, 180].includes(id),
          );
        }

        await this.sequelize.query(
          `UPDATE "companiesParametersOptions"
           SET "parametersList" = :parametersList,
               "optionOptionDependence" = :dependence,
               "updatedAt" = NOW()
           WHERE id = :id`,
          {
            replacements: {
              id: companyOptions.id,
              parametersList: [...parameterIds]
                .filter(Number.isFinite)
                .join(','),
              dependence: JSON.stringify(dependence),
            },
            transaction,
          },
        );
        await this.sequelize.query(
          `SELECT setval('"orderParameters_id_seq"',
            GREATEST((SELECT MAX(id) FROM "orderParameters"), 1), true)`,
          { transaction },
        );
      },
    );
  }

  private async ensurePrice(
    mainOptionId: number,
    value: number,
    conditionIds: number[],
    transaction: Transaction,
  ) {
    const [existing] = await this.sequelize.query<{ id: number }>(
      `SELECT p.id
       FROM price p
       WHERE p."companyId" = 3
         AND p."mainOptionId" = :mainOptionId
         AND p.value = :value
         AND (SELECT ARRAY_AGG(c."optionId" ORDER BY c."optionId")
              FROM "priceParametersOptionConditions" c
              WHERE c."priceId" = p.id) = ARRAY[${conditionIds.sort((a, b) => a - b).join(',')}]::INTEGER[]
       LIMIT 1`,
      {
        replacements: { mainOptionId, value },
        type: QueryTypes.SELECT,
        transaction,
      },
    );
    if (existing) return;

    const [created] = await this.sequelize.query<{ id: number }>(
      `INSERT INTO price
         ("companyId", value, "discountImpact", "mainOptionId", "createdAt", "updatedAt")
       VALUES (3, :value, true, :mainOptionId, NOW(), NOW())
       RETURNING id`,
      {
        replacements: { mainOptionId, value },
        type: QueryTypes.SELECT,
        transaction,
      },
    );
    const priceId = Number(created.id);
    for (const optionId of conditionIds) {
      await this.sequelize.query(
        `INSERT INTO "priceParametersOptionConditions" ("priceId", "optionId")
         VALUES (:priceId, :optionId)`,
        { replacements: { priceId, optionId }, transaction },
      );
    }
  }

  private async runOnce(
    name: string,
    callback: (transaction: Transaction) => Promise<void>,
  ) {
    const [existing] = await this.sequelize.query(
      `SELECT id FROM migrations WHERE name = :name`,
      { replacements: { name }, type: QueryTypes.SELECT },
    );
    if (existing) return;
    await this.sequelize.transaction(async (transaction) => {
      await callback(transaction);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES (:name) ON CONFLICT (name) DO NOTHING`,
        { replacements: { name }, transaction },
      );
    });
  }
}
