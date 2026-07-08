import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { OpportunityStage, Prisma } from '@prisma/client';

const STAGE_ORDER: Record<OpportunityStage, number> = {
  CONTACTO_INICIAL: 0,
  VISITA_TERRENO: 1,
  PROPUESTA_HONORARIOS: 2,
  NEGOCIACION: 3,
  CONTRATO_FIRMADO: 4,
  PERDIDO: 4,
};

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOpportunityDto, userId: string) {
    const opportunity = await this.prisma.opportunity.create({
      data: {
        name: dto.name,
        description: dto.description,
        amount: dto.amount ?? 0,
        probability: dto.probability ?? 0,
        stage: dto.stage ?? OpportunityStage.CONTACTO_INICIAL,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
        notes: dto.notes,
        companyId: dto.companyId,
        assignedTo: dto.assignedTo,
        leadId: dto.leadId,
      },
    });

    await this.createAuditLog('CREATE', 'Opportunity', opportunity.id, null, userId);
    this.logger.log(`Opportunity created: ${opportunity.id}`);

    return opportunity;
  }

  async findAll(query: QueryOpportunityDto) {
    const { page = 1, limit = 10, search, stage, assignedTo, companyId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OpportunityWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (stage) {
      where.stage = stage;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          assignedBy: true,
        },
      }),
      this.prisma.opportunity.count({ where }),
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
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: true,
        assignedBy: true,
        lead: true,
        quotes: true,
        tasks: true,
        activities: true,
      },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity ${id} no encontrada`);
    }

    return opportunity;
  }

  async update(id: string, dto: UpdateOpportunityDto, userId: string) {
    const existing = await this.findOne(id);
    const oldStage = existing.stage;

    const updateData = dto as any;
    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: updateData,
    });

    if (updateData.stage && updateData.stage !== oldStage) {
      await this.createAuditLog(
        'STAGE_CHANGE',
        'Opportunity',
        id,
        { from: oldStage, to: updateData.stage },
        userId,
      );
    }

    await this.createAuditLog('UPDATE', 'Opportunity', id, { before: existing, after: opportunity }, userId);
    this.logger.log(`Opportunity updated: ${id}`);

    return opportunity;
  }

  async updateStage(id: string, dto: UpdateStageDto, userId: string) {
    const opportunity = await this.findOne(id);
    const currentStage = opportunity.stage;
    const newStage = dto.stage;

    const currentOrder = STAGE_ORDER[currentStage];
    const newOrder = STAGE_ORDER[newStage];

    if (newOrder < currentOrder && !dto.reason) {
      throw new BadRequestException(
        'No se puede retroceder de etapa sin proporcionar una razón',
      );
    }

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: {
        stage: newStage,
        ...(newStage === OpportunityStage.CONTRATO_FIRMADO
          ? { closedAt: new Date(), probability: 100 }
          : {}),
        ...(newStage === OpportunityStage.PERDIDO
          ? { closedAt: new Date(), probability: 0, lossReason: dto.reason || null }
          : {}),
      },
    });

    await this.createAuditLog(
      'STAGE_CHANGE',
      'Opportunity',
      id,
      { from: currentStage, to: newStage, reason: dto.reason },
      userId,
    );

    this.logger.log(`Opportunity ${id} stage changed: ${currentStage} -> ${newStage}`);

    return updated;
  }

  async closeWon(id: string, userId: string) {
    return this.updateStage(id, { stage: OpportunityStage.CONTRATO_FIRMADO }, userId);
  }

  async closeLost(id: string, lossReason: string, userId: string) {
    return this.updateStage(
      id,
      { stage: OpportunityStage.PERDIDO, reason: lossReason },
      userId,
    );
  }

  async getPipelineStats() {
    const stages = Object.values(OpportunityStage);
    const stats = await Promise.all(
      stages.map(async (stage) => {
        const count = await this.prisma.opportunity.count({ where: { stage } });
        return { stage, count };
      }),
    );

    return stats;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.opportunity.delete({ where: { id } });

    await this.createAuditLog('DELETE', 'Opportunity', id, null, userId);
    this.logger.log(`Opportunity deleted: ${id}`);
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



