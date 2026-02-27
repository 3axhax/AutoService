import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { MigrationsOrders } from './migrations.orders';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(
    private readonly sequelize: Sequelize,
    private migrationOrders: MigrationsOrders,
  ) {}

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
    await this.migrationOrders.addTotalValueWithDiscountColumn();
    await this.migrationOrders.addUserIdColumn();
  }
}
