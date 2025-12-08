/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { PessoasService } from './pessoas.service';
import { Person } from './entities/pessoa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';

describe('PessoasService', () => {
  //Varáveis
  let pessoaService: PessoasService;
  let personRepository: Repository<Person>;
  let hashingService: HashingService;

  // Roda antes de cada teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            //mock de create e save simulando uma function
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

    //atribuindo valor as varáveis
    pessoaService = module.get<PessoasService>(PessoasService);
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person),
    );
    hashingService = module.get<HashingService>(HashingService);
  });

  //teste
  it('service should be defined', () => {
    expect(pessoaService).toBeDefined();
  });

  //outro describe com mais um teste
  describe('create', () => {
    //teste para ver se o método create está funcionando
    it('should create a new person', async () => {
      //CreatePessoaDto
      const createPessoaDto: CreatePessoaDto = {
        email: 'lucas@teste.com',
        name: 'lucas',
        password: '123456',
      };
      const passwordHash = 'HASHDESENHA';

      const novaPessoa = {
        id: 1,
        name: createPessoaDto.name,
        email: createPessoaDto.email,
        passwordHash,
      };
      //Que o hashing service tenha o método hash
      //saber se o hashing service foi chamado com CreatePessoaDto
      //Saber se o pessoaRepository.create foi chamado com dadosPessoa
      //Saber se pessoaRepository.save foi chamado com a pessoa criada
      //Saber se retorna uma nova pessoa criada = Expect

      // Observa o o método hash do service e ve se se retorna o hash de senha
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

      // Observa o o método create do repository e ve se se retorna os dados da nova pessoa
      jest.spyOn(personRepository, 'create').mockReturnValue(novaPessoa as any);

      //salva o resultado do método create

      //-----------------------------------------------------

      // ACT = Ação que executa o método.
      const result = await pessoaService.create(createPessoaDto);

      //-----------------------------------------------------
      //Assert
      // O método hashingService.hash foi chamado com createPessoaDto.password?
      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      );

      // saída esperada
      //O método pessoaRepository.create foi chamado com os dados da nova pessoa com o hash de senha gerado por hashingService.hash?
      expect(personRepository.create).toHaveBeenCalledWith({
        name: createPessoaDto.name,
        email: createPessoaDto.email,
        passwordHash: 'HASHDESENHA',
      });

      // saída esperada, uma nova pessoa criada
      //O método pessoaRepository.save foi chamado com os dados da nova pessoa gerado por pessoaRepository.create?
      expect(personRepository.save).toHaveBeenCalledWith(novaPessoa);

      // saída esperada, Verifica se o resultado e igual
      // O resultado do método pessoaService.create retornou a nova pessoa criada?
      expect(result).toEqual(novaPessoa);
    });
  });
});
