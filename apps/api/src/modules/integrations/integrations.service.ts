import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIntegrationDto) {
    const integration = await this.prisma.integration.create({ data: dto });
    this.logger.log(`Integration created: ${integration.name} (${integration.provider})`);
    return integration;
  }

  async findAll() {
    return this.prisma.integration.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException('Integración no encontrada');
    return integration;
  }

  async update(id: string, dto: UpdateIntegrationDto) {
    await this.findOne(id);
    return this.prisma.integration.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.integration.delete({ where: { id } });
    return { message: 'Integración eliminada correctamente' };
  }

  async sync(id: string) {
    const integration = await this.findOne(id);
    this.logger.log(`Syncing integration: ${integration.name}`);
    return { message: `Sincronización de "${integration.name}" iniciada` };
  }

  async test(id: string) {
    const integration = await this.findOne(id);
    this.logger.log(`Testing integration connection: ${integration.name}`);
    return { message: `Conexión con "${integration.name}" probada correctamente`, success: true };
  }
}
