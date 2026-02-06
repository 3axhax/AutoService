// src/migrations/migration.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    await this.runMigrations();
  }

  private async runMigrations() {
    await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.addTotalValueWithDiscountColumn();
  }

  private async addTotalValueWithDiscountColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM migrations WHERE name = 'add_totalValueWithDiscount_to_orders'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS "totalValueWithDiscount" FLOAT DEFAULT 0;
        `);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES ('add_totalValueWithDiscount_to_orders')`,
      );
      console.log('Migration add_totalValueWithDiscount_to_orders executed');
    }
  }
}
