import { Chat } from 'src/chat/entities/chat.entity';
import { Message } from 'src/chat/entities/message.entity';
import { UserChat } from 'src/chat/entities/user-chat.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
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

  @Column('text',
  {
    nullable: true,
  }
  )
  avatar?: string;

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

  @OneToMany(() => Chat, (chat) => chat.creator)
  createdChats: Chat[];

  @OneToMany(() => UserChat, (userChat) => userChat.user)
  userChats: UserChat[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];
 
}
