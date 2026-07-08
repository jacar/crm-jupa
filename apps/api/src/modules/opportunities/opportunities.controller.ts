import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@ApiTags('Opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva oportunidad' })
  create(@Body() dto: CreateOpportunityDto, @CurrentUser('id') userId: string) {
    return this.opportunitiesService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de oportunidades' })
  findAll(@Query() query: QueryOpportunityDto) {
    return this.opportunitiesService.findAll(query);
  }

  @Get('pipeline/stats')
  @ApiOperation({ summary: 'Obtener estadísticas del pipeline por etapa' })
  getPipelineStats() {
    return this.opportunitiesService.getPipelineStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una oportunidad por ID con relaciones' })
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una oportunidad' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.opportunitiesService.update(id, dto, userId);
  }

  @Patch(':id/stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar la etapa de una oportunidad' })
  updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.opportunitiesService.updateStage(id, dto, userId);
  }

  @Post(':id/close-won')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar oportunidad como ganada' })
  closeWon(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.opportunitiesService.closeWon(id, userId);
  }

  @Post(':id/close-lost')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar oportunidad como perdida con motivo' })
  closeLost(
    @Param('id') id: string,
    @Body('lossReason') lossReason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.opportunitiesService.closeLost(id, lossReason, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una oportunidad' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.opportunitiesService.remove(id, userId);
  }
}
