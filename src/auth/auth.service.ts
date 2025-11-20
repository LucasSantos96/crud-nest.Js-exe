import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Person } from 'src/pessoas/entities/pessoa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly pessoasRepository: Repository<Person>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {
    console.log(jwtConfiguration);
  }

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

    const accessToken = await this.jwtService.signAsync(
      {
        sub: person.id, // aceito perfeitamente como string
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl,
      },
    );

    return accessToken;
  }
}
