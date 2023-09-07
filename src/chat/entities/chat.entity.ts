import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { Message } from './message.entity';
import { UserChat } from './user-chat.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // For group chats

  @Column()
  type: string; 


  @OneToMany(() => UserChat, (userChat) => userChat.chat)
  chatMembers: UserChat[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @ManyToOne(() => User, (user) => user.createdChats)
  creator: User;
}
