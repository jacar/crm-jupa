import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(from?: string, to?: string) {
    const dateFilter = from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

    const invoiceDateFilter = from || to
      ? {
          paidAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

    const [
      revenueAgg,
      totalQuotes,
      totalOpportunities,
      wonOpportunities,
      totalInvoices,
      topSalespeople,
      topMaterials,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { status: 'PAID', ...invoiceDateFilter },
        _sum: { total: true },
        _count: { id: true },
      }),
      this.prisma.quote.count({ where: dateFilter }),
      this.prisma.opportunity.count({ where: dateFilter }),
      this.prisma.opportunity.count({
        where: { stage: 'CONTRATO_FIRMADO', ...dateFilter },
      }),
      this.prisma.invoice.count({ where: { status: 'PAID', ...invoiceDateFilter } }),
      this.prisma.invoice.groupBy({
        by: ['createdById'],
        where: { status: 'PAID', ...invoiceDateFilter },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
      this.prisma.invoiceItem.groupBy({
        by: ['materialId'],
        _sum: { total: true },
        where: {
          invoice: {
            status: 'PAID',
            ...invoiceDateFilter,
          },
        },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
    ]);

    const salespeopleIds = topSalespeople.map((s) => s.createdById);
    const materialIds = topMaterials.map((p) => p.materialId);

    const [salespeople, materialsData] = await Promise.all([
      salespeopleIds.length > 0
        ? this.prisma.user.findMany({
            where: { id: { in: salespeopleIds } },
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : Promise.resolve([]),
      materialIds.length > 0
        ? this.prisma.material.findMany({
            where: { id: { in: materialIds } },
            select: { id: true, name: true, reference: true },
          })
        : Promise.resolve([]),
    ]);

    const salespersonMap = new Map(salespeople.map((u) => [u.id, u]));
    const materialMap = new Map(materialsData.map((p) => [p.id, p]));

    const totalRevenue = revenueAgg._sum?.total ?? 0;
    const totalRevenueCount = revenueAgg._count?.id ?? 0;
    const conversionRate =
      totalQuotes > 0 ? totalInvoices / totalQuotes : 0;
    const avgDealSize =
      wonOpportunities > 0 && totalOpportunities > 0
        ? await this.prisma.opportunity.aggregate({
            where: { stage: 'CONTRATO_FIRMADO', ...dateFilter },
            _avg: { amount: true },
          })
        : null;

    return {
      totalRevenue,
      totalQuotes,
      conversionRate,
      avgDealSize: avgDealSize?._avg?.amount ?? 0,
      totalInvoices,
      topSalespeople: topSalespeople.map((s) => ({
        ...salespersonMap.get(s.createdById),
        totalRevenue: s._sum?.total ?? 0,
        invoiceCount: s._count?.id ?? 0,
      })),
      topMaterials: await Promise.all(
        topMaterials.map(async (p) => {
          const material = materialMap.get(p.materialId);
          return {
            ...material,
            totalRevenue: p._sum?.total ?? 0,
          };
        }),
      ),
    };
  }

  async getUsersReport() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            activities: true,
            tasks: true,
          },
        },
      },
    });

    const dealsWon = await this.prisma.opportunity.groupBy({
      by: ['assignedTo'],
      where: { stage: 'CONTRATO_FIRMADO' },
      _count: { id: true },
    });

    const revenueGen = await this.prisma.invoice.groupBy({
      by: ['createdById'],
      where: { status: 'PAID' },
      _sum: { total: true },
    });

    const dealsMap = new Map(dealsWon.map((d) => [d.assignedTo, d._count.id]));
    const revenueMap = new Map(revenueGen.map((r) => [r.createdById, r._sum?.total ?? 0]));

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      activitiesCount: user._count.activities,
      tasksCompleted: user._count.tasks,
      dealsWon: dealsMap.get(user.id) ?? 0,
      revenueGenerated: revenueMap.get(user.id) ?? 0,
    }));
  }

  async getPipelineReport() {
    const stages = await this.prisma.opportunity.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { stage: 'asc' },
    });

    return stages.map((s: any) => ({
      stage: s.stage,
      count: s._count.id,
      totalAmount: s._sum?.amount ?? 0,
    }));
  }

  async getConversionFunnel() {
    const [leads, opportunities, quotes, invoices] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.opportunity.count(),
      this.prisma.quote.count(),
      this.prisma.invoice.count({ where: { status: 'PAID' } }),
    ]);

    return {
      leads,
      opportunities,
      quotes,
      invoices,
    };
  }

  async getRevenueReport(year?: number) {
    const targetYear = year ?? new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${targetYear + 1}-01-01T00:00:00Z`);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: startDate, lt: endDate },
      },
      select: {
        total: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    const monthlyMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      monthlyMap[`${targetYear}-${String(i + 1).padStart(2, '0')}`] = 0;
    }

    for (const inv of invoices) {
      if (inv.paidAt) {
        const key = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = Number(monthlyMap[key]) + Number(inv.total);
      }
    }

    return Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }
}


