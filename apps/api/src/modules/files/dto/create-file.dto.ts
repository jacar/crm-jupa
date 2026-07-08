import { IsString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileCategory } from '@prisma/client';

export class CreateFileDto {
  @ApiProperty({ example: 'contrato-firma.pdf' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Contrato Firma.pdf' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 102400 })
  @IsNumber()
  size: number;

  @ApiProperty({ example: 'https://supabase.co/storage/v1/object/public/bucket/file.pdf' })
  @IsString()
  url: string;

  @ApiProperty({ enum: FileCategory, example: FileCategory.DOCUMENT })
  @IsEnum(FileCategory)
  category: FileCategory;

  @ApiProperty({ example: 'uuid-del-usuario' })
  @IsUUID()
  uploadedById: string;
}
