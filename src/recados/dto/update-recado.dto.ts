import { PartialType } from '@nestjs/mapped-types';
import { CreateRecadosDto } from './create-recado.dto';

export class UpdateRecadosDto extends PartialType(CreateRecadosDto) {}
