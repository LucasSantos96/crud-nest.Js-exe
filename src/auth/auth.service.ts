/* eslint-disable @typescript-eslint/no-unused-vars */
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Person } from 'src/pessoas/entities/pessoa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly pessoasRepository: Repository<Person>,
    private readonly hashingService: HashingService,
  ) {}

  async login(loginDto: LoginDto) {
    const person = await this.pessoasRepository.findOneBy({
      email: loginDto.email,
    });

    if (!person) {
      throw new UnauthorizedException('Pessoa não existe');
    }
    const passwordIsValid = await this.hashingService.compare(
      loginDto.password,
      person.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha inválida');
    }
    return {
      message: 'usuario logado',
    };
  }
}
