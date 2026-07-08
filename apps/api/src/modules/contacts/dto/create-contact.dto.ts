import { IsString, IsOptional, IsEmail, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'maria@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+56212345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '+56987654321' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ example: 'Gerente de Ventas' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ example: 'Comercial' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'Notas sobre el contacto' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: ['vip', 'cliente-frecuente'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'uuid-de-la-empresa' })
  @IsUUID()
  @IsOptional()
  companyId?: string;
}
