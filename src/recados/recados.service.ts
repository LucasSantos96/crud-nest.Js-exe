import { UpdateRecadosDto } from './dto/update-recado.dto';
import { CreateRecadosDto } from './dto/create-recado.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { Person } from 'src/pessoas/entities/pessoa.entity';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoasService: PessoasService,
  ) {}

  async findAll() {
    const recados = await this.recadoRepository.find({});
    return recados;
  }

  async findOne(id: string) {
    const recado = await this.recadoRepository.findOne({
      where: {
        id,
      },
    });
    if (recado) return recado;

    //throw new HttpException('Recado não encontrado.', HttpStatus.NOT_FOUND);
    throw new NotFoundException('Recado não encontrado.');
  }

  async create(createRecadosDto: CreateRecadosDto): Promise<Recado> {
    const { deId, paraId } = createRecadosDto;
    const de = await this.pessoasService.findOne(deId);
    const para = await this.pessoasService.findOne(paraId);

    const novoRecado = {
      ...createRecadosDto,
      de,
      para,
      lido: false,
      data: new Date(),
    };
    // create() apenas instancia a entidade, não precisa de await
    const recado = this.recadoRepository.create(novoRecado);
    // save() é que de fato salva no banco e retorna uma Promise
    await this.recadoRepository.save(recado);
    return {
      ...recado,
      de: {
        id: recado.de.id,
        name: recado.de.name,
      } as Person,

      para: {
        id: recado.para.id,
        name: recado.para.name,
      } as Person,
    };
  }

  async update(
    id: string,
    UpdateRecadosDto: UpdateRecadosDto,
  ): Promise<Recado> {
    const recado = await this.recadoRepository.preload({
      id,
      ...UpdateRecadosDto,
    });

    if (!recado) {
      throw new NotFoundException('Recado não encontrado');
    }
    return this.recadoRepository.save(recado);
  }

  async remove(id: string) {
    const recado = await this.recadoRepository.findOneBy({ id });

    if (!recado) {
      throw new NotFoundException('Recado não encontrado');
    }
    return this.recadoRepository.remove(recado);
  }
}
