import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary metrics' })
  getSummary(@CurrentUser('id') userId: string) {
    return this.dashboardService.getSummary(userId);
  }

  @Get('sales-pipeline')
  @ApiOperation({ summary: 'Get opportunity counts per stage' })
  getSalesPipeline() {
    return this.dashboardService.getSalesPipeline();
  }

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Get monthly revenue for the last 12 months' })
  getMonthlyRevenue() {
    return this.dashboardService.getMonthlyRevenue();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get last 10 activities' })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('kpi')
  @ApiOperation({ summary: 'Get key performance indicators' })
  getKpi() {
    return this.dashboardService.getKpi();
  }
}
