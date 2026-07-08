import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Llamar al cliente' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Realizar llamada de seguimiento' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'medium', enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ example: '2026-08-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'uuid-de-la-oportunidad' })
  @IsUUID()
  @IsOptional()
  opportunityId?: string;
}
