import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/users/entities/user.entity';
import { Attachment } from './attachment.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments: Attachment[];
}
