import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileCategory } from '@prisma/client';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFileDto) {
    const file = await this.prisma.file.create({ data: dto });
    this.logger.log(`File created: ${file.name}`);
    return file;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    category?: FileCategory;
    uploadedById?: string;
  }) {
    const { page = 1, limit = 10, category, uploadedById } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (category) where.category = category;
    if (uploadedById) where.uploadedById = uploadedById;

    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.file.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!file) throw new NotFoundException('Archivo no encontrado');
    return file;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.file.delete({ where: { id } });
    return { message: 'Archivo eliminado correctamente' };
  }
}
