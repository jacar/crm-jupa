import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCalendarEventDto) {
    const event = await this.prisma.calendarEvent.create({ data: dto });
    this.logger.log(`Calendar event created: ${event.title}`);
    return event;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, startDate, endDate } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (startDate || endDate) {
      where.OR = [];
      if (startDate) {
        where.OR.push({ endDate: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.OR.push({ startDate: { lte: new Date(endDate) } });
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      this.prisma.calendarEvent.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(id: string, dto: UpdateCalendarEventDto) {
    await this.findOne(id);
    const event = await this.prisma.calendarEvent.update({ where: { id }, data: dto });
    return event;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { message: 'Evento eliminado correctamente' };
  }
}
