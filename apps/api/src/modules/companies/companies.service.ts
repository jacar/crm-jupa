import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const company = await this.prisma.company.create({ data: dto });
    this.logger.log(`Company created: ${company.name}`);
    return company;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    segment?: string;
    isClient?: boolean;
  }) {
    const { page = 1, limit = 10, search, industry, segment, isClient } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) where.industry = industry;
    if (segment) where.segment = segment;
    if (isClient !== undefined) where.isClient = isClient;

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        contacts: true,
        users: true,
        leads: true,
        opportunities: true,
        quotes: true,
        invoices: true,
        projects: true,
      },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    const company = await this.prisma.company.update({
      where: { id },
      data: dto,
    });
    return company;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.company.update({
      where: { id },
      data: { isClient: false },
    });
    return { message: 'Empresa desactivada correctamente' };
  }

  async convertToClient(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Empresa no encontrada');

    const updated = await this.prisma.company.update({
      where: { id },
      data: { isClient: true },
    });
    this.logger.log(`Company converted to client: ${updated.name}`);
    return updated;
  }
}
