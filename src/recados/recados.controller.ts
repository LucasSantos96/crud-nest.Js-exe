import { CreateRecadosDto } from './dto/create-recado.dto';
import { UpdateRecadosDto } from './dto/update-recado.dto';
import { Recado } from './entities/recado.entity';
import { RecadosService } from './recados.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('recados')
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}

  //ler todos os recados
  @Get()
  findAll() {
    //const { limit = 10, offset = 0 } = pagination;

    return this.recadosService.findAll();
  }
  //ler um recado
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recadosService.findOne(id);
  }
  //Criar um recado
  @Post()
  create(@Body() CreateRecadosDto: CreateRecadosDto): Promise<Recado> {
    return this.recadosService.create(CreateRecadosDto);
  }

  //Atualizar um recado
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateRecadosDto: UpdateRecadosDto) {
    return this.recadosService.update(id, UpdateRecadosDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recadosService.remove(id);
  }
}
