/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Repository } from 'typeorm';
import { PessoasService } from './pessoas.service';
import { Person } from './entities/pessoa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PessoasService', () => {
  // descreve o conjunto de testes para PessoasService
  //Varáveis
  let pessoaService: PessoasService; // variável que armazenará a instância do service
  let personRepository: Repository<Person>; // variável para o mock do repositório
  let hashingService: HashingService; // variável para o mock do hashing service

  // Roda antes de cada teste
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // cria um módulo de teste isolado
      providers: [
        PessoasService, // registra o serviço real a ser testado
        {
          provide: getRepositoryToken(Person), // token usado pelo Nest para identificar o repositório de Person
          useValue: {
            // mock de create e save simulando uma função (jest.fn())
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: HashingService, // injeta um mock do HashingService
          useValue: {
            hash: jest.fn(), // mock da função hash
          },
        },
      ],
    }).compile(); // compila o módulo de teste

    //atribuindo valor as varáveis
    pessoaService = module.get<PessoasService>(PessoasService); // obtém instância do service a partir do módulo de teste
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person), // obtém o mock do repositório usando o mesmo token
    );
    hashingService = module.get<HashingService>(HashingService); // obtém o mock do hashing service
  });

  //teste
  it('service should be defined', () => {
    // caso de teste simples: o service foi instanciado corretamente?
    expect(pessoaService).toBeDefined(); // afirma que pessoaService não é undefined
  });

  //outro describe com mais um teste
  describe('create', () => {
    // grupo de testes relacionados ao método create
    //teste para ver se o método create está funcionando
    it('should create a new person', async () => {
      //CreatePessoaDto
      const createPessoaDto: CreatePessoaDto = {
        email: 'lucas@teste.com',
        name: 'lucas',
        password: '123456',
      }; // dados de entrada do teste

      const passwordHash = 'HASHDESENHA'; // valor que o hash deve retornar no mock

      const novaPessoa = {
        id: 1,
        name: createPessoaDto.name,
        email: createPessoaDto.email,
        passwordHash,
      }; // objeto esperado retornado pelo repositório (mock)

      // Observa o o método hash do service e ve se se retorna o hash de senha
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash); // faz o mock de hashingService.hash para resolver com passwordHash

      // Observa o o método create do repository e ve se se retorna os dados da nova pessoa
      jest.spyOn(personRepository, 'create').mockReturnValue(novaPessoa as any); // faz o mock de personRepository.create retornando novaPessoa

      // ACT = Ação que executa o método.
      const result = await pessoaService.create(createPessoaDto); // executa o método create do service

      //Assert
      // O método hashingService.hash foi chamado com createPessoaDto.password?
      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      ); // verifica se o hash foi chamado corretamente

      // O método pessoaRepository.create foi chamado com os dados da nova pessoa com o hash de senha gerado por hashingService.hash?
      expect(personRepository.create).toHaveBeenCalledWith({
        name: createPessoaDto.name,
        email: createPessoaDto.email,
        passwordHash: 'HASHDESENHA',
      }); // verifica se create foi chamado com os dados corretos

      // O método pessoaRepository.save foi chamado com os dados da nova pessoa gerado por pessoaRepository.create?
      expect(personRepository.save).toHaveBeenCalledWith(novaPessoa); // confirma que save foi chamado com a entidade criada

      // O resultado do método pessoaService.create retornou a nova pessoa criada?
      expect(result).toEqual(novaPessoa); // garante que o service retornou o que se esperava
    });

    //teste para ver se o erro esta sendo lançado
    it('should return conflict error', async () => {
      jest.spyOn(personRepository, 'save').mockRejectedValue({
        code: '23505',
      }); // faz o mock de personRepository.save lançando um erro com code '23505' (unique violation Postgres)

      await expect(pessoaService.create({} as any)).rejects.toThrow(
        ConflictException,
      ); // espera que a chamada ao create dispare uma ConflictException
    });

    //teste para ver se o erro esta sendo lançado
    it('should return error', async () => {
      jest
        .spyOn(personRepository, 'save')
        .mockRejectedValue(new Error('Erro genérico')); // faz o mock de personRepository.save lançando um erro genérico

      await expect(pessoaService.create({} as any)).rejects.toThrow(Error); // espera que a chamada ao create dispare um Error
    });
  });

  describe('findOne', () => {
    it('should return a person if the person be found', async () => {
      const personId = '123';
      const personFound = {
        id: personId,
        name: 'lucas',
        email: 'email@email.com',
        passwordHash: 'PASSWORDHASH',
      };

      jest
        .spyOn(personRepository, 'findOneBy')
        .mockResolvedValue(personFound as any);

      const result = await pessoaService.findOne(personId);
      expect(result).toEqual(personFound);
    });

    it('should return undefined if the person not be found', async () => {
      const personId = '123';
      const personFound = {
        id: personId,
        name: 'lucas',
        email: 'email@email.com',
        passwordHash: 'PASSWORDHASH',
      };
      await expect(pessoaService.findOne(personId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fildAll', () => {
    it('should return all', async () => {
      //cria um array de pessoas
      const peopleMock: Person[] = [];
      //Observa o repository,find e retorna o valor resolvido como peopleMock (Array de pessoas)
      jest.spyOn(personRepository, 'find').mockResolvedValue(peopleMock);

      //ACTION= Busca todas as pessoas
      const result = await pessoaService.findAll();

      //espera que o result seja igual ao peopleMock( array de pessoas)
      expect(result).toEqual(peopleMock);
    });
  });
});
