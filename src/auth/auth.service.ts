/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Person } from 'src/pessoas/entities/pessoa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly pessoasRepository: Repository<Person>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const person = await this.pessoasRepository.findOneBy({
      email: loginDto.email,
      active: true,
    });

    if (!person) {
      throw new UnauthorizedException('Pessoa não autorizada');
    }
    const passwordIsValid = await this.hashingService.compare(
      loginDto.password,
      person.passwordHash,
    );
    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha inválida');
    }
    return this.createTokens(person);
  }

  private async createTokens(person: Person) {
    const accessToken = await this.signJwtAsync<Partial<Person>>(
      person.id,
      this.jwtConfiguration.jwtTtl,
      { email: person.email },
    );

    const refreshToken = await this.signJwtAsync(
      person.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    return { accessToken, refreshToken };
  }

  private async signJwtAsync<T>(sub: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshToken: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshToken.refreshToken,
        this.jwtConfiguration,
      );
      const person = await this.pessoasRepository.findOneBy({
        id: sub,
        active: true,
      });
      if (!person) throw new Error('Pessoa não autorizada');

      return this.createTokens(person);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
