import {
  Controller, Get, Post, Body, Param, Patch, Delete, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas (paginado, búsqueda, filtro)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o RUT' })
  @ApiQuery({ name: 'industry', required: false, description: 'Filtrar por industria' })
  @ApiQuery({ name: 'segment', required: false, description: 'Filtrar por segmento' })
  @ApiQuery({ name: 'isClient', required: false, description: 'Filtrar por cliente' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Query('segment') segment?: string,
    @Query('isClient') isClient?: string,
  ) {
    return this.companiesService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      search,
      industry,
      segment,
      isClient: isClient !== undefined ? isClient === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID (con relaciones)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una empresa' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una empresa' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.remove(id);
  }

  @Patch(':id/convert-to-client')
  @ApiOperation({ summary: 'Convertir empresa en cliente' })
  convertToClient(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.convertToClient(id);
  }
}


