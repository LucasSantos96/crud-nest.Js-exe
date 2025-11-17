import { PaginationDto } from 'src/app/common/dto/pagination.dto';
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
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AddHeaderInterceptor } from 'src/app/common/interceptor/add-header.interceptor';

import { UrlParams } from 'src/app/common/params/url.params';

@Controller('recados')
@UseInterceptors(AddHeaderInterceptor)
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}

  //ler todos os recados
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @UrlParams() url: string,
  ) {
    console.log(url);

    const recados = await this.recadosService.findAll(paginationDto);
    return recados;
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
