import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        type: dto.type,
        subject: dto.subject,
        description: dto.description,
        result: dto.result,
        duration: dto.duration,
        scheduledAt: dto.scheduledAt,
        contactId: dto.contactId,
        opportunityId: dto.opportunityId,
        userId: dto.userId,
      },
      include: {
        contact: true,
        opportunity: true,
        user: true,
      },
    });
    this.logger.log(`Activity created: ${activity.subject} (${activity.type})`);
    return activity;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
    contactId?: string;
    opportunityId?: string;
    from?: string;
    to?: string;
  }) {
    const { page = 1, limit = 10, type, userId, contactId, opportunityId, from, to } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from);
      if (to) where.scheduledAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: true,
          opportunity: true,
          user: true,
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        contact: true,
        opportunity: true,
        user: true,
      },
    });
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto) {
    await this.findOne(id);
    const activity = await this.prisma.activity.update({
      where: { id },
      data: dto,
      include: {
        contact: true,
        opportunity: true,
        user: true,
      },
    });
    return activity;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.activity.delete({ where: { id } });
    return { message: 'Actividad eliminada correctamente' };
  }

  async markAsComplete(id: string) {
    const activity = await this.findOne(id);
    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      include: {
        contact: true,
        opportunity: true,
        user: true,
      },
    });
    this.logger.log(`Activity completed: ${updated.subject}`);
    return updated;
  }
}
