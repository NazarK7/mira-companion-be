// backend/src/plants/dto/create-plant.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PlantContactDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsOptional() role?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
}

export class CreatePlantDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Array dinamico per i contatti
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlantContactDto)
  contacts?: PlantContactDto[];
}