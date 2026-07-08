import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Reporte de ventas con rango de fechas' })
  @ApiQuery({ name: 'from', required: false, description: 'Fecha inicio (ISO)' })
  @ApiQuery({ name: 'to', required: false, description: 'Fecha fin (ISO)' })
  getSalesReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getSalesReport(from, to);
  }

  @Get('users')
  @ApiOperation({ summary: 'Reporte de rendimiento de usuarios' })
  getUsersReport() {
    return this.reportsService.getUsersReport();
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Reporte de pipeline por etapa' })
  getPipelineReport() {
    return this.reportsService.getPipelineReport();
  }

  @Get('conversion')
  @ApiOperation({ summary: 'Embuido de conversión Lead → Opportunity → Quote → Invoice' })
  getConversionFunnel() {
    return this.reportsService.getConversionFunnel();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Reporte de ingresos por mes' })
  @ApiQuery({ name: 'year', required: false, example: 2026, description: 'Año para el reporte' })
  getRevenueReport(@Query('year') year?: string) {
    return this.reportsService.getRevenueReport(year ? +year : undefined);
  }
}
