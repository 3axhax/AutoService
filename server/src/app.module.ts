import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.model';
import { UsersModule } from './users/users.module';
import { Role } from './roles/roles.model';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { UsersSessionsModule } from './users/usersSessions/usersSessions.module';
import { UserRole } from './roles/users-roles.model';
import { UsersSessions } from './users/usersSessions/usersSessions.model';
import { AuthGuard } from './auth/auth.guard';
import { OrderParametersModule } from './orderParameters/orderParameters.module';
import { OrderParameters } from './orderParameters/orderParameters.model';
import { Companies } from './companies/companies.model';
import { CompaniesModule } from './companies/companies.module';
import { OrderParametersOptions } from './orderParametersOptions/orderParametersOptions.model';
import { OrderParametersOptionsModule } from './orderParametersOptions/orderParametersOptions.module';
import { CompaniesParametersOptions } from './companiesParametersOptions/companiesParametersOptions.model';
import { CompaniesParametersOptionsModule } from './companiesParametersOptions/companiesParametersOptions.module';
import { Price } from './price/price.model';
import { PriceModule } from './price/price.module';
import { PriceParametersOptionConditions } from './price/priceParametersOptionConditions.model';
import { Orders } from './orders/orders.model';
import { OrdersOptionValues } from './orders/ordersOptionValues.model';
import { Shifts } from './shifts/shifts.model';
import { OrdersModule } from './orders/orders.module';
import { AdditionalWorks } from './additopnalWorks/additionalWorks.model';
import { AdditionalWorksModule } from './additopnalWorks/additionalWorks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        User,
        Role,
        UserRole,
        UsersSessions,
        OrderParameters,
        Companies,
        OrderParametersOptions,
        CompaniesParametersOptions,
        Price,
        PriceParametersOptionConditions,
        Orders,
        OrdersOptionValues,
        Shifts,
        AdditionalWorks,
      ],
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    UsersSessionsModule,
    OrderParametersModule,
    CompaniesModule,
    OrderParametersOptionsModule,
    CompaniesParametersOptionsModule,
    PriceModule,
    OrdersModule,
    AdditionalWorksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
