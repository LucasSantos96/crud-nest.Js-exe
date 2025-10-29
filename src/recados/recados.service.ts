import { UpdateRecadosDto } from './dto/update-recado.dto';
import { CreateRecadosDto } from './dto/create-recado.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RecadoEntity } from './entities/recado.entity';

@Injectable()
export class RecadosService {
  private lastId = 1;
  private recados: RecadoEntity[] = [
    {
      id: 1,
      texto: '',
      de: '',
      para: '',
      lido: false,
      data: new Date(),
    },
  ];

  findAll() {
    return this.recados;
  }

  findOne(id: string) {
    const recado = this.recados.find((item) => item.id === +id);
    if (recado) return recado;

    //throw new HttpException('Recado não encontrado.', HttpStatus.NOT_FOUND);
    throw new NotFoundException('Recado não encontrado.');
  }

  create(CreateRecadosDto: CreateRecadosDto) {
    this.lastId++;
    const id = this.lastId;
    const newRecado = {
      id,
      ...CreateRecadosDto,
      lido: false,
      data: new Date(),
    };
    this.recados.push(newRecado);
    return newRecado;
  }

  update(id: string, UpdateRecadosDto: UpdateRecadosDto) {
    const isRecado = this.recados.findIndex((item) => item.id === +id);
    if (isRecado < 0) {
      throw new NotFoundException('Recado não encontrado.');
    }
    const recadoExist = this.recados[isRecado];

    this.recados[isRecado] = {
      ...recadoExist,
      ...UpdateRecadosDto,
    };
    return recadoExist;
  }

  remove(id: string) {
    const isIndex = this.recados.findIndex((item) => item.id === +id);

    if (isIndex < 0) {
      throw new NotFoundException('Recado não encontrado.');
    }

    const recado = this.recados[isIndex];
    this.recados.splice(isIndex, 1);
    return recado;
  }
}
