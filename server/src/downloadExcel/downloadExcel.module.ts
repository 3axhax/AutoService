import { Module } from '@nestjs/common';
import { DownloadExcelService } from './downloadExcel.service';

@Module({
  providers: [DownloadExcelService],
  exports: [DownloadExcelService],
})
export class DownloadExcelModule {}
