import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIntegrationDto {
  @ApiPropertyOptional({ example: 'Mercado Pago' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'mercadopago' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ example: { apiKey: '...', secret: '...' } })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
