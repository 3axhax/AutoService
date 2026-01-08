import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShiftsService } from './shifts.service';
import { Shifts } from './shifts.model';
import { ShiftsController } from './shifts.controller';

@Module({
  providers: [ShiftsService],
  controllers: [ShiftsController],
  imports: [SequelizeModule.forFeature([Shifts])],
  exports: [ShiftsService],
})
export class ShiftsModule {}
