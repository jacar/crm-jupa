import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ example: 'Laptop Pro 15"' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Laptop de última generación' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'LP-001' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 1499.99 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 999.99 })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 'Electrónicos' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'unit' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  @IsString()
  @IsOptional()
  image?: string;
}

