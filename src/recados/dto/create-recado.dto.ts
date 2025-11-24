import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateRecadosDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly texto: string;

  @IsUUID()
  @IsNotEmpty()
  paraId: string;

  @IsBoolean()
  lido: boolean;
}
