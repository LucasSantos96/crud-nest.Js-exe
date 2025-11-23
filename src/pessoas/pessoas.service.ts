import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

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
    } catch (err) {
      console.error(err);
    }
  }

  async findAll() {
    const person = await this.PersonRepository.find();
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
    return this.PersonRepository.save(person);
  }

  async remove(id: string, tokenPayloadDto: TokenPayloadDto) {
    const person = await this.PersonRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Pessoa com id ${id} não encontrada`);
    }
    return await this.PersonRepository.remove(person);
  }
}
