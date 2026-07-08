import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PipelineService } from './pipeline.service';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las etapas del pipeline' })
  findAll() {
    return this.pipelineService.findAll();
  }

  @Get(':opportunityId')
  @ApiOperation({ summary: 'Obtener historial de pipeline para una oportunidad' })
  findByOpportunity(@Param('opportunityId') opportunityId: string) {
    return this.pipelineService.findByOpportunity(opportunityId);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar un registro de movimiento de etapa' })
  create(@Body() dto: CreatePipelineStageDto) {
    return this.pipelineService.create(dto);
  }
}
