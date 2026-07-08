import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: dto,
      include: { company: true },
    });
    this.logger.log(`Contact created: ${contact.firstName} ${contact.lastName}`);
    return contact;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
  }) {
    const { page = 1, limit = 10, search, companyId } = params;
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        leads: true,
        activities: true,
      },
    });
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    return contact;
  }

  async update(id: string, dto: UpdateContactDto) {
    await this.findOne(id);
    const contact = await this.prisma.contact.update({
      where: { id },
      data: dto,
      include: { company: true },
    });
    return contact;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contact.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Contacto desactivado correctamente' };
  }
}
