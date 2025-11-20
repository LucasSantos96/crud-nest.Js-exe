import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import * as config from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constantes';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Não logado!');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Falaha ao logar!', error.name);
    }
    return true;
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') {
      return;
    }
    return authorization.split(' ')[1];
  }
}
