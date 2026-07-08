import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva integración' })
  create(@Body() dto: CreateIntegrationDto) {
    return this.integrationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las integraciones' })
  findAll() {
    return this.integrationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una integración por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.integrationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una integración' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateIntegrationDto) {
    return this.integrationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar una integración' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.integrationsService.remove(id);
  }

  @Post(':id/sync')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ejecutar sincronización de integración' })
  sync(@Param('id', ParseUUIDPipe) id: string) {
    return this.integrationsService.sync(id);
  }

  @Post(':id/test')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Probar conexión de integración' })
  test(@Param('id', ParseUUIDPipe) id: string) {
    return this.integrationsService.test(id);
  }
}
