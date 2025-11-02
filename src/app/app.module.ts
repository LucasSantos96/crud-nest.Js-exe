import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecadosModule } from 'src/recados/recados.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'postgres',
      password: '629321',
      autoLoadEntities: true, //carrega entidades sem precusar especifica-las,
      synchronize: true, //Sincroniza com o banco de dados, OBS: Não deve ser usado em produção.
    }),
    RecadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
