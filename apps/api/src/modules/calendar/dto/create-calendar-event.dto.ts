import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCalendarEventDto {
  @ApiProperty({ example: 'Reunión con cliente' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Reunión para revisar propuesta' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Sala de conferencias A' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '2026-07-15T09:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-15T10:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  userId: string;

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
