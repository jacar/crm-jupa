import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCalendarEventDto {
  @ApiPropertyOptional({ example: 'Reunión con cliente' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Reunión para revisar propuesta' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Sala de conferencias A' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: '2026-07-15T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'uuid-del-usuario' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ example: 'uuid-de-la-oportunidad' })
  @IsUUID()
  @IsOptional()
  opportunityId?: string;

  @ApiPropertyOptional({ example: 'google-event-id' })
  @IsString()
  @IsOptional()
  googleEventId?: string;

  @ApiPropertyOptional({ example: 'outlook-event-id' })
  @IsString()
  @IsOptional()
  outlookEventId?: string;
}
