import { Chat } from 'src/chat/entities/chat.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column('text')
  firstName: string;
  
  @Column('text')
  lastName: string;

  @Column('text', {
    nullable: true,
    })
  refreshToken: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];
    messages: any;

  @ManyToMany(() => Chat, chat => chat.users)
  @JoinTable()
  chats: Chat[];
 
}
