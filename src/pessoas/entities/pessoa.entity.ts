import { IsEmail } from 'class-validator';
import { Recado } from 'src/recados/entities/recado.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  @IsEmail()
  email: string;

  @Column({ length: 100 })
  passwordHash: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  //uma pessoa pode ter enviado muitos recados como ("de")
  //Esses recados são relacionados ao campo "de" na entidade recado
  @OneToMany(() => Recado, (recado) => recado.de)
  recadosEnviados: Recado[];

  //uma pessoa pode ter recebido muitos recados como ("para")
  //Esses recados são relacionados ao campo "para" na entidade recado
  @OneToMany(() => Recado, (recado) => recado.para)
  recadosRecebidos: Recado[];

  @Column({ default: true })
  active: boolean;

  @Column({ default: '' })
  picture: string;
}
