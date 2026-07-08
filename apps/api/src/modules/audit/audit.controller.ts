import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un registro de auditoría (uso interno)' })
  create(@Body() dto: {
    action: string;
    entity: string;
    entityId?: string;
    changes?: any;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.auditService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar auditoría (solo ADMIN)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'entity', required: false, description: 'Filtrar por entidad (tabla)' })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha inicio (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha fin (ISO)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      entity,
      entityId,
      action,
      userId,
      startDate,
      endDate,
    });
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Obtener auditoría de una entidad específica' })
  findByEntity(
    @Param('entity') entity: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.auditService.findByEntity(entity, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de auditoría por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findOne(id);
  }
}


