import {
  Controller, Get, Post, Body, Param, Delete, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileCategory } from '@prisma/client';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un archivo subido a Supabase Storage' })
  create(@Body() dto: CreateFileDto) {
    return this.filesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar archivos (paginado, filtro por categoría y usuario)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'category', required: false, enum: FileCategory })
  @ApiQuery({ name: 'uploadedById', required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: FileCategory,
    @Query('uploadedById') uploadedById?: string,
  ) {
    return this.filesService.findAll({
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
      category,
      uploadedById,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un archivo por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un archivo' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.remove(id);
  }
}


