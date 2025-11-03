import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/pessoa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Person)
    private readonly PersonRepository: Repository<Person>,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    const newPerson = {
      name: createPessoaDto.name,
      email: createPessoaDto.email,
      passwordHash: createPessoaDto.password,
    };
    const person = this.PersonRepository.create(newPerson);
    await this.PersonRepository.save(person);
    return person;
  }

  async findAll() {
    const person = await this.PersonRepository.find();
    return person;
  }
  async update(id: string, updatePessoaDto: UpdatePessoaDto) {
    const personData = {
      name: updatePessoaDto?.name,
      passwordHash: updatePessoaDto?.password,
      email: updatePessoaDto?.email,
    };
    const person = await this.PersonRepository.preload({
      id,
      ...personData,
    });
    if (!person) {
      throw new NotFoundException(`Pessoa com id ${id} não encontrada`);
    }
    return this.PersonRepository.save(person);
  }
}
