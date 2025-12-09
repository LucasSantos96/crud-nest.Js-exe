/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Person)
    private readonly PersonRepository: Repository<Person>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPessoaDto.password,
      );
      const newPerson = {
        name: createPessoaDto.name,
        email: createPessoaDto.email,
        passwordHash,
      };
      const person = this.PersonRepository.create(newPerson);
      await this.PersonRepository.save(person);
      return person;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
      console.error(error);
    }
  }

  async findAll() {
    const person = await this.PersonRepository.find({ order: { id: 'DESC' } });
    return person;
  }
  async findOne(id: string) {
    const person = await this.PersonRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Pessoa com id ${id} não encontrada`);
    }
    return person;
  }
  async update(
    id: string,
    updatePessoaDto: UpdatePessoaDto,
    tokenPayloadDto: TokenPayloadDto,
  ) {
    const personData = {
      name: updatePessoaDto?.name,
      //passwordHash: updatePessoaDto?.password,
      email: updatePessoaDto?.email,
    };
    if (updatePessoaDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updatePessoaDto.password,
      );
      personData['passwordHash'] = passwordHash;
    }

    const person = await this.PersonRepository.preload({
      id,
      ...personData,
    });
    if (!person) {
      throw new NotFoundException(`Pessoa com id ${id} não encontrada`);
    }

    if (person.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException(
        'NEGADO! Você só pode atualizar sua própria conta',
      );
    }

    return this.PersonRepository.save(person);
  }

  async remove(id: string, tokenPayloadDto: TokenPayloadDto) {
    const person = await this.PersonRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Pessoa com id ${id} não encontrada`);
    }
    if (person.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException(
        'NEGADO! Você só pode remover sua própria conta',
      );
    }
    return await this.PersonRepository.remove(person);
  }

  async UploadPicture(
    file: Express.Multer.File,
    TokenPayloadDto: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('File Too Small');
    }
    const person = await this.findOne(TokenPayloadDto.sub);
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);
    const fileName = `${TokenPayloadDto.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);
    await fs.writeFile(fileFullPath, file.buffer);

    person.picture = fileName;
    await this.PersonRepository.save(person);
    return person;
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
