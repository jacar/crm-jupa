import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({ data: dto });
    this.logger.log(`Task created: ${task.title}`);
    return task;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    isCompleted?: boolean;
    userId?: string;
    priority?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }) {
    const { page = 1, limit = 10, isCompleted, userId, priority, dueDateFrom, dueDateTo } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (isCompleted !== undefined) {
      where.isCompleted = isCompleted;
    }

    if (userId) {
      where.userId = userId;
    }

    if (priority) {
      where.priority = priority;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    const task = await this.prisma.task.update({ where: { id }, data: dto });
    return task;
  }

  async markComplete(id: string) {
    await this.findOne(id);
    const task = await this.prisma.task.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() },
    });
    this.logger.log(`Task completed: ${task.title}`);
    return task;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Tarea eliminada correctamente' };
  }
}
