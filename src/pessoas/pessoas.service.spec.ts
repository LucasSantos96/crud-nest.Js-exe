/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { PessoasService } from './pessoas.service';
import { Person } from './entities/pessoa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { create } from 'domain';

describe('PessoasService', () => {
  let pessoaService: PessoasService;
  let personRepository: Repository<Person>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    pessoaService = module.get<PessoasService>(PessoasService);
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person),
    );
    hashingService = module.get<HashingService>(HashingService);
  });

  it('service should be defined', () => {
    expect(pessoaService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new person', async () => {
      //CreatePessoaDto
      const createPessoaDto: CreatePessoaDto = {
        email: 'lucas@teste.com',
        name: 'lucas',
        password: '123456',
      };
      //Que o hashing service tenha o método hash
      //saber se o hashing service foi chamado com CreatePessoaDto
      //Saber se o pessoaRepository.create foi chamado com dadosPessoa
      //Saber se pessoaRepository.save foi chamado com a pessoa criada
      //Saber se retorna uma nova pessoa criada = Expect

      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASHDESENHA');

      await pessoaService.create(createPessoaDto);

      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      );

      expect(personRepository.create).toHaveBeenCalledWith({
        name: createPessoaDto.name,
        email: createPessoaDto.email,
        passwordHash: 'HASHDESENHA',
      });
    });
  });
});
