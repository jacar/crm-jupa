import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({ example: 'Mercado Pago' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'mercadopago' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ example: { apiKey: '...', secret: '...' } })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
