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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth.token.guard';
import * as Request from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from 'src/auth/auth.constantes';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs/promises';

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

  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadPicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @TokenPayloadParam()
    TokenPayloadDto: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('File Too Small');
    }
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);
    const fileName = `${TokenPayloadDto.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);
    await fs.writeFile(fileFullPath, file.buffer);
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: {},
      size: file.size,
    };
  }
}
//exemplo usado para reveber multiplas fotos
/*const result: string[] = [];
    files.forEach(async (file) => {
      const fileExtension = path
        .extname(file.originalname)
        .toLowerCase()
        .substring(1);
      const fileName = `${randomUUID()}.${fileExtension}`;
      const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);
      result.push(fileFullPath);
      await fs.writeFile(fileFullPath, file.buffer);
    });
    return result;*/
