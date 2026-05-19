// backend/src/customers/dto/create-customer.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ContactDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsOptional() role?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() category?: any; // Mappa con l'enum corretto se serve
  @IsString() @IsOptional() notes?: string;
}

export class CreateCustomerDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsOptional() shortName?: string;
  @IsString() @IsOptional() notes?: string;

  // Nuova proprietà per i contatti
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts?: ContactDto[];
}