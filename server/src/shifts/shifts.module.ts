import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShiftsService } from './shifts.service';
import { Shifts } from './shifts.model';

@Module({
  providers: [ShiftsService],
  imports: [SequelizeModule.forFeature([Shifts])],
  exports: [ShiftsService],
})
export class ShiftsModule {}
