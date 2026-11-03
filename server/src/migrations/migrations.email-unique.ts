import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

export const EMAIL_UNIQUE_MIGRATION = 'add_users_normalized_email_unique';
export const EMAIL_UNIQUE_INDEX_SQL =
  'CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_unique ON users (lower(btrim(email)))';

/** Enforce normalized uniqueness without rewriting existing email values. */
export async function applyEmailUniqueness(sequelize: Sequelize) {
  await sequelize.transaction(async (transaction) => {
    await sequelize.query(
      'SELECT pg_advisory_xact_lock(92031, hashtext(:name))',
      {
        replacements: { name: EMAIL_UNIQUE_MIGRATION },
        type: QueryTypes.SELECT,
        transaction,
      },
    );
    const [duplicates] = await sequelize.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM (SELECT lower(btrim(email)) FROM users GROUP BY lower(btrim(email)) HAVING COUNT(*) > 1) duplicates',
      { type: QueryTypes.SELECT, transaction },
    );
    if (Number(duplicates.count) > 0)
      throw new Error('Email duplicates must be resolved before migration');
    await sequelize.query(EMAIL_UNIQUE_INDEX_SQL, { transaction });
    await sequelize.query(
      'INSERT INTO migrations (name) VALUES (:name) ON CONFLICT (name) DO NOTHING',
      {
        replacements: { name: EMAIL_UNIQUE_MIGRATION },
        transaction,
      },
    );
  });
}
