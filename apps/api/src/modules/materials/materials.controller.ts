import {
  Controller, Get, Post, Body, Param, Patch, Delete, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Materials')
export class MaterialsController {
  constructor(private readonly MaterialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo Materialo' })
  create(@Body() dto: CreateMaterialDto) {
    return this.MaterialsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar Materialos (paginado, búsqueda, filtro)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o SKU' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoría' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.MaterialsService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      search,
      category,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un Materialo por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.MaterialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un Materialo' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMaterialDto) {
    return this.MaterialsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un Materialo (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.MaterialsService.remove(id);
  }
}


