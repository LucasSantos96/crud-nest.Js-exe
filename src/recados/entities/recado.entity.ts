import { Person } from 'src/pessoas/entities/pessoa.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Recado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  texto: string;

  @Column({ default: false })
  lido: boolean;

  @Column()
  data: Date; //createdAt

  @CreateDateColumn()
  createdAt?: Date; //createdAt

  @UpdateDateColumn()
  updateAt?: Date; //updateAt

  @ManyToOne(() => Person) //Muitos recados podem ser enviados por uma unica pessoa(emissor)
  //Especifica a coluna "de" que armazena o id da pessoa que enviou o recado
  @JoinColumn({ name: 'de' })
  de: Person;

  @ManyToOne(() => Person) //Muitos recados podem ser enviados por uma unica pessoa(destinatário)
  //Especifica a coluna "de" que armazena o id da pessoa que enviou o recado
  @JoinColumn({ name: 'para' })
  para: Person;
}
