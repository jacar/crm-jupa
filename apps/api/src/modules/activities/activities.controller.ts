import {
  Controller, Get, Post, Body, Param, Patch, Delete, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar actividades (paginado, filtros)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo (CALL, EMAIL, MEETING, WHATSAPP, VISIT, TASK, NOTE)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'contactId', required: false, description: 'Filtrar por contacto' })
  @ApiQuery({ name: 'opportunityId', required: false, description: 'Filtrar por oportunidad' })
  @ApiQuery({ name: 'from', required: false, description: 'Fecha inicio (ISO)' })
  @ApiQuery({ name: 'to', required: false, description: 'Fecha fin (ISO)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('contactId') contactId?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.activitiesService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      type,
      userId,
      contactId,
      opportunityId,
      from,
      to,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una actividad' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.update(id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar actividad como completada' })
  markAsComplete(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.markAsComplete(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una actividad' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.remove(id);
  }
}


