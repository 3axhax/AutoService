import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MigrationsUsers {
  constructor(private readonly sequelize: Sequelize) {}
  async addConfirmedColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM migrations WHERE name = 'add_confirmed_to_users'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS "confirmed" BOOLEAN DEFAULT false;
        `);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES ('add_confirmed_to_users')`,
      );
      console.log('Migration add_confirmed_to_users executed');
    }
  }
  async addConfirmedDateColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM migrations WHERE name = 'add_confirmedDate_to_users'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS "confirmedDate" TIMESTAMPTZ DEFAULT null;
        `);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES ('add_confirmedDate_to_users')`,
      );
      console.log('Migration add_confirmedDate_to_users executed');
    }
  }
  async addConfirmedTokenColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM migrations WHERE name = 'add_confirmedToken_to_users'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS "confirmedToken" varchar(255) DEFAULT '';
        `);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES ('add_confirmedToken_to_users')`,
      );
      console.log('Migration add_confirmedToken_to_users executed');
    }
  }
  async addAdminTokenColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM migrations WHERE name = 'add_adminToken_to_users'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS "adminToken" varchar(255) DEFAULT '';
        `);
      await this.sequelize.query(
        `INSERT INTO migrations (name) VALUES ('add_adminToken_to_users')`,
      );
      console.log('Migration add_adminToken_to_users executed');
    }
  }
}
