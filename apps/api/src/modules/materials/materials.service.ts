import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
    const Material = await this.prisma.material.create({
      data: {
        name: dto.name,
        description: dto.description,
        reference: dto.reference,
        price: dto.price,
        cost: dto.cost,
        category: dto.category,
        unit: dto.unit,
        image: dto.image,
      },
    });
    this.logger.log(`Material created: ${Material.name}`);
    return Material;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const { page = 1, limit = 10, search, category } = params;
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [data, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.material.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const Material = await this.prisma.material.findUnique({
      where: { id },
    });
    if (!Material) throw new NotFoundException('Materialo no encontrado');
    return Material;
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findOne(id);
    const Material = await this.prisma.material.update({
      where: { id },
      data: dto,
    });
    return Material;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.material.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Materialo desactivado correctamente' };
  }
}


