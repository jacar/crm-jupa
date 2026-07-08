import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findByOpportunity(opportunityId: string) {
    return this.prisma.pipelineStage.findMany({
      where: { opportunityId },
      orderBy: { order: 'asc' },
    });
  }

  async create(dto: CreatePipelineStageDto) {
    const stage = await this.prisma.pipelineStage.create({
      data: dto,
    });
    this.logger.log(`Pipeline stage created: ${stage.id}`);
    return stage;
  }
}
