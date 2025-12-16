import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { UpdateRecadosDto } from './dto/update-recado.dto';
import { CreateRecadosDto } from './dto/create-recado.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from '../../src/pessoas/pessoas.service';
import { Person } from 'src/pessoas/entities/pessoa.entity';
import { TokenPayloadDto } from '../../src/auth/dto/token-payload.dto';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoasService: PessoasService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(paginationDto: PaginationDto) {
    // const { limit = 10, offset = 0 } = paginationDto;

    const recados = await this.recadoRepository.find({
      //  take: limit, //quantos registros serão exibidos
      // skip: offset, //quantos registros devem ser pulados
      relations: ['de', 'para'],
      order: {
        id: 'DESC',
      },
    });
    return recados;
  }

  async findOne(id: string) {
    const recado = await this.recadoRepository.findOne({
      where: {
        id,
      },
      relations: ['de'],
    });
    if (recado) return recado;

    //throw new HttpException('Recado não encontrado.', HttpStatus.NOT_FOUND);
    throw new NotFoundException('Recado não encontrado.');
  }

  async create(
    createRecadosDto: CreateRecadosDto,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<Recado> {
    const { paraId } = createRecadosDto;
    const de = await this.pessoasService.findOne(tokenPayloadDto.sub);
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
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<Recado> {
    const recado = await this.recadoRepository.findOne({
      where: { id },
      relations: ['de'],
    });

    if (!recado) {
      throw new NotFoundException('Recado não encontrado');
    }

    if (recado.de.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException(
        'Você não pode alterar um recado que não e seu',
      );
    }

    Object.assign(recado, UpdateRecadosDto);

    await this.recadoRepository.save(recado);
    return recado;
  }

  async remove(id: string, tokenPayloadDto: TokenPayloadDto) {
    const recado = await this.findOne(id);

    if (recado.de.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException(
        'Você não pode alterar um recado que não e seu',
      );
    }
    return this.recadoRepository.remove(recado);
  }
}
