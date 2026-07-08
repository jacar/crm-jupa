import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { LeadStatus, Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto, userId: string) {
    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name,
        description: dto.description,
        source: dto.source,
        campaign: dto.campaign,
        score: dto.score ?? 0,
        status: dto.status ?? LeadStatus.NEW,
        probability: dto.probability ?? 0,
        notes: dto.notes,
        companyId: dto.companyId,
        contactId: dto.contactId,
        assignedTo: dto.assignedTo,
      },
    });

    await this.createAuditLog('CREATE', 'Lead', lead.id, null, userId);
    this.logger.log(`Lead created: ${lead.id}`);

    return lead;
  }

  async findAll(query: QueryLeadDto) {
    const { page = 1, limit = 10, search, status, assignedTo } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        assignedBy: true,
        opportunity: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} no encontrado`);
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, userId: string) {
    const existing = await this.findOne(id);
    const oldStatus = existing.status;

    const updateData = dto as any;
    const lead = await this.prisma.lead.update({
      where: { id },
      data: updateData,
    });

    if (updateData.status && updateData.status !== oldStatus) {
      await this.createAuditLog(
        'STATUS_CHANGE',
        'Lead',
        id,
        { from: oldStatus, to: updateData.status },
        userId,
      );
    }

    await this.createAuditLog('UPDATE', 'Lead', id, { before: existing, after: lead }, userId);
    this.logger.log(`Lead updated: ${id}`);

    return lead;
  }

  async updateStatus(id: string, status: LeadStatus, userId: string) {
    const lead = await this.findOne(id);
    const oldStatus = lead.status;

    if (status === LeadStatus.CONVERTED && oldStatus !== LeadStatus.QUALIFIED) {
      lead.status = status;
      lead.convertedAt = new Date();
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        status,
        ...(status === LeadStatus.CONVERTED ? { convertedAt: new Date() } : {}),
      },
    });

    await this.createAuditLog(
      'STATUS_CHANGE',
      'Lead',
      id,
      { from: oldStatus, to: status },
      userId,
    );

    this.logger.log(`Lead ${id} status changed: ${oldStatus} -> ${status}`);

    return updated;
  }

  async assign(id: string, assignedTo: string, userId: string) {
    const lead = await this.findOne(id);

    const updated = await this.prisma.lead.update({
      where: { id },
      data: { assignedTo },
    });

    await this.createAuditLog(
      'ASSIGN',
      'Lead',
      id,
      { from: lead.assignedTo, to: assignedTo },
      userId,
    );

    this.logger.log(`Lead ${id} assigned to user ${assignedTo}`);

    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.lead.delete({ where: { id } });

    await this.createAuditLog('DELETE', 'Lead', id, null, userId);
    this.logger.log(`Lead deleted: ${id}`);
  }

  private async createAuditLog(
    action: string,
    entity: string,
    entityId: string,
    changes: any,
    userId: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
        userId,
      },
    });
  }
}
