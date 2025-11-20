import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth.token.guard';
import * as Request from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from 'src/auth/auth.constantes';

@UseGuards(AuthTokenGuard)
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    console.log(req[REQUEST_TOKEN_PAYLOAD_KEY]);
    return this.pessoasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pessoasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePessoaDto: UpdatePessoaDto) {
    return this.pessoasService.update(id, updatePessoaDto);
  }
}
