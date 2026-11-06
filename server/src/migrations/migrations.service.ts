import { migrateCompanyThreeDiscounts } from './migrations.company-three-discounts';
import { migrateCompanyThreeMaterialPrices } from './migrations.company-three-material-prices';
import { migrateCompanyThreeRepair } from './migrations.company-three-repair';
import { migrateCompanyThreePayment } from './migrations.company-three-payment';
import { migrateCompanyThreeTruckPrices } from './migrations.company-three-truck';
import { applyEmailUniqueness } from './migrations.email-unique';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { MigrationsOrders } from './migrations.orders';
import { MigrationsUsers } from './migrations.users';
import { MigrationsPriceTests } from './migrations.price-tests';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(
    private readonly sequelize: Sequelize,
    private migrationOrders: MigrationsOrders,
    private migrationsUsers: MigrationsUsers,
    private migrationsPriceTests: MigrationsPriceTests,
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
    await Promise.all(
      ['orders', 'users'].map(async (model) => {
        switch (model) {
          case 'orders':
            await this.migrationOrders.addTotalValueWithDiscountColumn();
            await this.migrationOrders.addUserIdColumn();
            break;
          case 'users':
            await this.migrationsUsers.addConfirmedColumn();
            await this.migrationsUsers.addConfirmedDateColumn();
            await this.migrationsUsers.addConfirmedTokenColumn();
            await this.migrationsUsers.addAdminTokenColumn();
            break;
        }
      }),
    );
    await applyEmailUniqueness(this.sequelize);
    await this.migrationsPriceTests.addCompositeOperationIdColumn();
    await this.migrationsPriceTests.addCompanyThreePriceTestCoverage();
    await this.migrationsPriceTests.makeTireRepairConfigurableParameter();
    await migrateCompanyThreeTruckPrices(this.sequelize);
    await migrateCompanyThreePayment(this.sequelize);
    await migrateCompanyThreeRepair(this.sequelize);
    await migrateCompanyThreeDiscounts(this.sequelize);
    await migrateCompanyThreeMaterialPrices(this.sequelize);
  }
}
