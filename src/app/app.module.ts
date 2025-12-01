import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from 'src/recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      //ignoreEnvFile: true
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      database: process.env.DATABASE_DATABASE,
      password: process.env.DATABASE_PASSWORD,
      autoLoadEntities: Boolean(process.env.DATABASE_AUTOLOADENTITIES), //carrega entidades sem precusar especifica-las,
      synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE), //Sincroniza com o banco de dados, OBS: Não deve ser usado em produção.
    }),
    RecadosModule,
    PessoasModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', '/pictures'),
      serveRoot: '/pictures',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
