import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('user_chats')
export class UserChat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userChats)
  user: User;

  @ManyToOne(() => Chat, (chat) => chat.chatMembers)
  chat: Chat;
}
