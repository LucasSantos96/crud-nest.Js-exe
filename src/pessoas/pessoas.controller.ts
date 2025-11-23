/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth.token.guard';
import * as Request from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from 'src/auth/auth.constantes';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const payloadResponse = req[REQUEST_TOKEN_PAYLOAD_KEY];
    console.log('SUCESSO! \n Dados do payload', payloadResponse);
    return this.pessoasService.findAll();
  }
  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pessoasService.findOne(id);
  }
  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePessoaDto: UpdatePessoaDto,
    @TokenPayloadParam() TokenPayloadDto: TokenPayloadDto,
  ) {
    return this.pessoasService.update(id, updatePessoaDto, TokenPayloadDto);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @TokenPayloadParam() TokenPayloadDto: TokenPayloadDto,
  ) {
    return this.pessoasService.remove(id, TokenPayloadDto);
  }
}
