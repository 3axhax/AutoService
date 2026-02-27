import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MigrationsOrders {
  constructor(private readonly sequelize: Sequelize) {}
  async addTotalValueWithDiscountColumn() {
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

  async addUserIdColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM migrations WHERE name = 'add_userId_to_orders'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE orders 
          ADD COLUMN IF NOT EXISTS "userId" FLOAT DEFAULT 0;
        `);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES ('add_userId_to_orders')`,
      );
      console.log('Migration add_userId_to_orders executed');
    }
  }
}
