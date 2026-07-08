import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { OpportunityStage, InvoiceStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      monthlySalesResult,
      newClients,
      activeClients,
      lostClients,
      totalQuotes,
      totalRevenueResult,
      activeProjects,
      pendingTasks,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
      }),
      this.prisma.company.count({
        where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
      }),
      this.prisma.company.count({ where: { isClient: true } }),
      this.prisma.opportunity.count({
        where: {
          stage: OpportunityStage.PERDIDO,
          closedAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
      }),
      this.prisma.quote.count({
        where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
      }),
      this.prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: InvoiceStatus.PAID },
      }),
      this.prisma.project.count({
        where: { status: { equals: 'in_progress' } },
      }),
      this.prisma.task.count({
        where: { userId, isCompleted: false },
      }),
    ]);

    return {
      monthlySales: monthlySalesResult._sum.total ?? 0,
      newClients,
      activeClients,
      lostClients,
      totalQuotes,
      totalRevenue: totalRevenueResult._sum.total ?? 0,
      activeProjects,
      pendingTasks,
    };
  }

  async getSalesPipeline() {
    const stages = Object.values(OpportunityStage);
    const stats = await Promise.all(
      stages.map(async (stage) => {
        const count = await this.prisma.opportunity.count({ where: { stage } });
        return { stage, count };
      }),
    );
    return stats;
  }

  async getMonthlyRevenue() {
    const now = new Date();
    const result: { month: number; year: number; amount: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const agg = await this.prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          status: InvoiceStatus.PAID,
          paidAt: { gte: start, lt: end },
        },
      });

      result.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        amount: Number(agg._sum.total ?? 0),
      });
    }

    return result;
  }

  async getRecentActivities() {
    return this.prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getKpi() {
    const [totalOpportunities, wonOpportunities, opportunities] =
      await Promise.all([
        this.prisma.opportunity.count(),
        this.prisma.opportunity.count({
          where: { stage: OpportunityStage.CONTRATO_FIRMADO },
        }),
        this.prisma.opportunity.findMany({
          where: {
            stage: { in: [OpportunityStage.CONTRATO_FIRMADO, OpportunityStage.PERDIDO] },
            closedAt: { not: null },
          },
          select: { amount: true, stage: true, closedAt: true, createdAt: true },
        }),
      ]);

    const conversionRate =
      totalOpportunities > 0 ? wonOpportunities / totalOpportunities : 0;

    const wonAmounts = opportunities
      .filter((o) => o.stage === OpportunityStage.CONTRATO_FIRMADO)
      .map((o) => Number(o.amount ?? 0));

    const avgDealSize =
      wonAmounts.length > 0
        ? wonAmounts.reduce((a, b) => a + b, 0) / wonAmounts.length
        : 0;

    const closedWon = opportunities.filter(
      (o) => o.stage === OpportunityStage.CONTRATO_FIRMADO && o.closedAt && o.createdAt,
    );
    const avgClosingTimeDays =
      closedWon.length > 0
        ? closedWon.reduce((sum, o) => {
            const diff =
              o.closedAt!.getTime() - o.createdAt.getTime();
            return sum + diff / (1000 * 60 * 60 * 24);
          }, 0) / closedWon.length
        : 0;

    return { conversionRate, avgDealSize, avgClosingTimeDays };
  }
}

